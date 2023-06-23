from .models import Sensor

class MyDBRouter(object):

    def db_for_read(self, model, **hints):
        if model == Sensor:
            return 'sensor_db'
        return 'default'

    def db_for_write(self, model, **hints):
        if model == Sensor:
            return 'sensor_db'
        return 'default'