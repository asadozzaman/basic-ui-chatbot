
// Navigation
const navLinks = document.querySelectorAll('nav a');
const pages = document.querySelectorAll('.page');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.dataset.page;
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));
        
        link.classList.add('active');
        document.getElementById(targetPage).classList.add('active');
    });
});

// Sample data for table
const tableData = [
    { bay: 'J2', week: 46, images: 4, area: 5, average: 25 },
    { bay: 'J4', week: 46, images: 4, area: 5, average: 31 },
    { bay: 'J6', week: 46, images: 4, area: 5, average: 33 },
    { bay: 'J2', week: 47, images: 4, area: 5, average: 29 }
];

// Populate table
const tbody = document.querySelector('tbody');
tableData.forEach(row => {
    tbody.innerHTML += `
        <tr>
            <td>${row.bay}</td>
            <td>${row.week}</td>
            <td>${row.images}</td>
            <td>${row.area}</td>
            <td>${row.average}</td>
        </tr>
    `;
});

// Charts
const densityCtx = document.getElementById('densityChart').getContext('2d');
const bayLevelCtx = document.getElementById('bayLevelChart').getContext('2d');

new Chart(densityCtx, {
    type: 'line',
    data: {
        labels: Array.from({length: 10}, (_, i) => (i + 1) * 10),
        datasets: [{
            label: 'Current Fruit Density',
            data: [2, 15, 30, 35, 25, 15, 8, 4, 2, 1],
            borderColor: '#4361ee',
            fill: true,
            backgroundColor: 'rgba(67, 97, 238, 0.1)'
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Current Fruit Density Distribution'
            }
        }
    }
});

new Chart(bayLevelCtx, {
    type: 'bar',
    data: {
        labels: ['J2', 'J3', 'J4', 'J6'],
        datasets: [{
            label: 'Average Fruit per m²',
            data: [25, 28, 31, 33],
            backgroundColor: '#4361ee'
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Bay Level Fruit Density'
            }
        }
    }
});

// Upload functionality
const uploadBox = document.querySelector('.upload-box');
const uploadFileInput = uploadBox.querySelector('input');

uploadBox.addEventListener('click', () => uploadFileInput.click());

uploadFileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
        uploadBox.querySelector('h3').textContent = `${files.length} files selected`;
    }
});

// Analysis form file upload handling
const analysisFileInput = document.querySelector('.upload-box input[type="file"]');
if (analysisFileInput) {
    analysisFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileName = document.querySelector('.upload-box p');
            if (fileName) {
                fileName.textContent = `Selected: ${file.name}`;
            }
        }
    });
}

// Analyze button functionality
const analyzeButton = document.querySelector('.analyze-btn');
if (analyzeButton) {
    analyzeButton.addEventListener('click', () => {
        // Add your analysis logic here
        console.log('Analyzing data...');
    });
}
