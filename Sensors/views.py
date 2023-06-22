from datetime import datetime
from django.utils import timezone
import io
from django.shortcuts import render
from django.views.generic import View, ListView
from django.http import JsonResponse, FileResponse
from django.http import JsonResponse, FileResponse

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
                  {'sensornames': sensornames,
                   'datatypes': datatypes})


def graphics(request):
    records = Sensor.objects.all()
    sensornames = list(set(records.values_list('sensorname', flat=True)))
    datatypes = list(set(records.values_list('datatype', flat=True)))
    position = list(set(records.values_list('position', flat=True)))
    return render(request, 'Sensors/graphics.html')


def filter_table(request):
    try:
        filter_params = json.loads(request.body)

        filterset = {
            "sensorname__in": filter_params['sensornames'],
            "datatype__in": filter_params['datatypes'],
        }

        if filter_params.get('start_date') is not None:
            filterset["date__gte"] = get_mytimezone_date(
                filter_params['start_date'])
        if filter_params.get('end_date') is not None:
            filterset["date__lte"] = get_mytimezone_date(
                filter_params['end_date'])

        filtered_sensors = Sensor.objects.filter(
            **filterset).order_by(filter_params["order_by"])
        filter_page = filter_params['page']
    except Exception as e:
        print(e)
        return JsonResponse({"status": "error"})

    if filter_page > 0:
        paginator = Paginator(filtered_sensors, 15)
        num_pages = paginator.num_pages
        cur_page = (filter_page-1) % num_pages + 1

        page_obj = paginator.get_page(cur_page)
        response = {
            'status': "ok",
            'cur_page': cur_page,
            'page_count': num_pages,
            'data': [SensorAPISerializer(obj) for obj in page_obj]
        }
        return JsonResponse(response)
    elif filter_page == 0 and filtered_sensors.count() > 0:
        binary_response = io.BytesIO()
        binary_response.write(
            "Название сенсора;Позиция;Тип показателя;Показатель;Дата и время\n".encode())
        for sensor in filtered_sensors:
            sensor_data_str = f"{sensor.sensorname};{sensor.position};{sensor.datatype};{sensor.value};{sensor.date}\n"
            binary_response.write(sensor_data_str.encode())
        binary_response.seek(0)
        return FileResponse(binary_response, as_attachment=True, filename='table.csv')
    else:
        return JsonResponse({"status": "error"})


def sensor_records(request):
    try:
        sensor_unique_fields = json.loads(request.body)
        sensor_recors = Sensor.objects.filter(sensorname=sensor_unique_fields['sensorname'],
                                              datatype=sensor_unique_fields['datatype'],
                                              position=sensor_unique_fields['position']).order_by("date")

        response = {
            "status": "ok",
            "records": [SensorAPISerializer(record) for record in sensor_recors]
        }
    except:
        return JsonResponse({"status": "error"})
    else:
        return JsonResponse(response)


def filter_update(request):
    try:
        selected_filters = json.loads(request.body)

        records = Sensor.objects.filter(**selected_filters)
        sensornames = list(set(records.values_list('sensorname', flat=True)))
        datatypes = list(set(records.values_list('datatype', flat=True)))
        positions = sorted(list(set(records.values_list('position', flat=True))), key=lambda x: int(x), reverse=True)

        response = {
            "sensornames": sensornames,
            "datatypes": datatypes,
            "positions": positions
        }
    except:
        return JsonResponse({"status": "error"})
    else:
        return JsonResponse(response)


def get_mytimezone_date(original_datetime):
    new_datetime = datetime.strptime(original_datetime, '%Y-%m-%d %H:%M')
    tz = timezone.get_current_timezone()
    timezone_datetime = timezone.make_aware(new_datetime, tz, True)
    return timezone_datetime
