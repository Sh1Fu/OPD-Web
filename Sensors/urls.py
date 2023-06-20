from django.urls import path, include
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('graphics', views.graphics, name='graphics'),
    path('api/', include([
        path('update_filters', views.filter_update, name='update_filters_api'),
        path('table_filter', views.filter_table, name='table_filter_api'),
        path('sensor_records', views.sensor_records, name='sensor_records_api'),
    ]))
]


