from django.db import models



class Sensor(models.Model):
    # Field name made lowercase.
    id = models.AutoField(db_column='ID', primary_key=True)
    # Field name made lowercase.
    sensorname = models.CharField(db_column='SensorName', max_length=45)
    # Field name made lowercase.
    datatype = models.CharField(db_column='DataType', max_length=45)
    # Field name made lowercase.
    position = models.CharField(db_column='Position', max_length=45)
    # Field name made lowercase.
    value = models.CharField(db_column='Value', max_length=45)
    date = models.DateTimeField(db_column='Date')  # Field name made lowercase.


    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        """
        return self.sensorname

    class Meta:
        managed = False
        db_table = 'sensor_data_table'


Sensor.objects = Sensor.objects.using('sensor_db')
