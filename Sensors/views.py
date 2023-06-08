from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse

from Sensors.serializers import SensorAPISerializer
from .models import Sensor
from django.core.paginator import Paginator

import json
# Create your views here.

def index(request):
    # Get all records and slice 15
    records = Sensor.objects.all()
    sensornames = list(set(records.values_list('sensorname', flat=True)))
    datatypes = list(set(records.values_list('datatype', flat=True)))
    return render(request,
                  'Sensors/index.html',
                  {'records': records})
def detailed(request, sensorname, position, datatype):
    sensor_by_time = Sensor.objects.filter(sensorname=sensorname,
                                           position=position,
                                           datatype=datatype)
    return JsonResponse(sensor_by_time)

class APIView(View):
    def get(self, request):
        try:
            filter_params = json.loads(request.body)
            filtered_sensors = Sensor.objects.filter(sensorname__in=filter_params['sensornames'],
                                                     datatype__in=filter_params['datatypes']).order_by(filter_params["order_by"])
            paginator = Paginator(filtered_sensors, 10)
            num_pages = paginator.num_pages

            cur_page = (filter_params['page']-1)%num_pages + 1
            
            if not 0<cur_page<=num_pages:
                return JsonResponse({"status":"error"})

            page_obj = paginator.get_page(cur_page)
            response = {
                'status': "ok",
                'cur_page': cur_page,
                'page_count': num_pages,
                'data': [SensorAPISerializer(obj) for obj in page_obj]
            }          
        except:
            return JsonResponse({"status":"error"})
        else:
            return JsonResponse(response)
        
# Задача на бэк оптимизировать этот try. Как-то некрасиво он выглядит вместе с конструкцией
# if not 0<cur_page<=num_pages:
#                 return JsonResponse({"status":"error"})
    