from django.shortcuts import render
from .models import Sensor
# Create your views here.

def index(request):
    # Get all records and slice 15
    first_records = Sensor.objects.all()[:15]

    return render(request,
                  'Sensors/index.html',
                  {'records': first_records})
