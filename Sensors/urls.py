from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('graphics', views.graphics, name='graphics'),
    path('detailed/<str:sensorname>-<int:position>-<str:datatype>',
          views.detailed, name='detailed'),
    path('api', views.APIView.as_view(), name='api')
]
