from django.shortcuts import render
from django.http import JsonResponse
from .models import Parcel
import json

from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from mapviewer.gemini_analysis import analyze
import os
import markdown  # Add this at the top
from django.http import StreamingHttpResponse






def upload_and_analyze(request):
    result = None

    print('hiii')
    print('result',result)
    if request.method == 'POST' and request.FILES['file']:
        file = request.FILES['file']
        data_type = request.POST['data_type']
        prompt = request.POST['prompt']
        print('prompt',prompt)
        fs = FileSystemStorage()
        file_path = fs.save(file.name, file)
        full_path = fs.path(file_path)

        result = analyze(data_type, full_path, prompt)
        result_html = markdown.markdown(result)  # Convert Markdown to HTML
        print('result_html-------After',result_html)
        os.remove(full_path)

    return render(request, 'mapviewer/index.html', {'result_html': result_html})





def map_view(request):
    return render(request, 'mapviewer/index.html')

from django.views.decorators.csrf import csrf_exempt
from .models import Parcel
import json

@csrf_exempt
def save_shape(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        geojson = data.get('geojson')
        area = data.get('area')
        name = data.get('name', 'Unnamed Parcel')

        Parcel.objects.create(name=name, area=area, geojson=json.dumps(geojson))
        return JsonResponse({'status': 'saved'})

    return JsonResponse({'error': 'Only POST allowed'}, status=400)

def get_shapes(request):
    parcels = Parcel.objects.all()
    result = []

    for p in parcels:
        geo = json.loads(p.geojson)
        geo['properties'] = {
            'name': p.name,
            'area': p.area,
            'id': p.id
        }
        result.append(geo)

    return JsonResponse(result, safe=False)

import time

@csrf_exempt
def delete_shape(request, parcel_id):
    if request.method == 'DELETE':
        try:
            parcel = Parcel.objects.get(id=parcel_id)
            parcel.delete()
            return JsonResponse({'status': 'deleted'})
        except Parcel.DoesNotExist:
            return JsonResponse({'error': 'Parcel not found'}, status=404)
    return JsonResponse({'error': 'Only DELETE allowed'}, status=400)

def get_parcels(request):
    start_time = time.time()
    
    parcels = Parcel.objects.all()
    total_area = sum(parcel.area for parcel in parcels)
    
    processing_time = round((time.time() - start_time) * 1000, 2)  # Convert to milliseconds
    
    context = {
        'parcels': parcels,
        'total_area': round(total_area, 2),
        'parcel_count': parcels.count(),
        'processing_time': processing_time
    }
    return render(request, 'mapviewer/parcels.html', context)
