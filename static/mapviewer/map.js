// Initialize the map
// const map = L.map('map').setView([23.685, 90.356], 7); // You can change this to your country/region
const map = L.map('map').setView([-37.7870, 175.2793], 13); // Hamilton, NZ

// Load tile layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; OpenStreetMap contributors'
// }).addTo(map);


// L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_TOKEN', {
//   attribution: '© Mapbox © OpenStreetMap',
//   tileSize: 512,
//   zoomOffset: -1
// }).addTo(map);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri',
  maxZoom: 22 // Increase zoom level (try up to 22)

}).addTo(map);



// Feature group for drawn layers
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Enable drawing
const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems
  },
  draw: {
    polygon: true,
    polyline: false,
    circle: false,
    rectangle: true,
    marker: false,
    circlemarker: false
  }
});
map.addControl(drawControl);

// Handle shape creation
// Handle shape creation and saving
map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  const geojson = layer.toGeoJSON();
  const area = Math.round(turf.area(geojson));
  const name = prompt("Enter name for this parcel:", "New Area") || "Unnamed Parcel";

  geojson.properties = { name: name, area: area };
  layer.bindPopup(`${name} - ${area} m²`).openPopup();

  // Save to server
  fetch('/save-shape/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify({ geojson, name, area })
  });

  document.getElementById("areaOutput").innerText = `Last marked area: ${area} m²`;
});



function searchLocation() {
    const location = document.getElementById('locationSearch').value;
    if (!location) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          alert("Location not found!");
          return;
        }

        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        map.setView([lat, lon], 15); // Zoom to location
      })
      .catch(err => {
        console.error(err);
        alert("Error searching location");
      });
  }



  //////////////////////


// Load previously saved shapes
fetch('/get-shapes/')
  .then(res => res.json())
  .then(data => {
    // Add to map
    data.forEach(geojson => {
      const layer = L.geoJSON(geojson, {
        style: {
          fillColor: '#4CAF50',
          fillOpacity: 0.3,
          color: '#2E7D32',
          weight: 2
        },
        onEachFeature: function (feature, layer) {
          const name = feature.properties?.name || "Unnamed";
          const area = feature.properties?.area || "N/A";
          layer.bindPopup(`<strong>${name}</strong><br>Area: ${area} m²`);
        }
      }).addTo(drawnItems);
    });

    // Update table
    const tbody = document.querySelector('#parcelTable tbody');
    tbody.innerHTML = '';

    data.forEach((geojson, index) => {
      const name = geojson.properties?.name || "Unnamed";
      const area = geojson.properties?.area || "N/A";
      const id = geojson.properties?.id;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${name}</td>
        <td>${area}</td>
        <td>
          <button onclick="showParcelArea(${index})">
            View on Map
          </button>
        </td>
        <td>
          <button class="delete-btn" onclick="deleteParcel(${id})">Delete</button>
          <img class="parcel-preview" style="display: none; max-width: 200px; max-height: 200px;" />
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Store geojson data globally
    window.parcelData = data;
  })
  .catch(error => console.error('Error loading parcels:', error));



function showParcelArea(index) {
  const geojson = window.parcelData[index];
  const layer = L.geoJSON(geojson);
  const bounds = layer.getBounds();

  // Fit map to the parcel bounds
  map.fitBounds(bounds, {
    padding: [50, 50]
  });

  // Wait for map animation to complete
  setTimeout(() => {
    // Get image of the current map view
    const mapContainer = map.getContainer();
    html2canvas(mapContainer).then(canvas => {
      // Find the corresponding table row
      const rows = document.querySelectorAll('#parcelTable tr');
      for (let row of rows) {
        if (row.cells[0].textContent === geojson.properties.name) {
          const img = row.querySelector('.parcel-preview');
          img.src = canvas.toDataURL();
          img.style.display = 'block';
          break;
        }
      }
    });
  }, 1000);
}

function deleteParcel(parcelId) {
  if (confirm('Are you sure you want to delete this parcel?')) {
    fetch(`/delete-shape/${parcelId}/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': csrftoken
      }
    })
    .then(response => {
      if (response.ok) {
        // Refresh the page to update the table
        window.location.reload();
      } else {
        alert('Error deleting parcel');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error deleting parcel');
    });
  }
}