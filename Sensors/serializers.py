#No need to include restframework
def SensorAPISerializer(Sensormodel):
    return {
        "sensorname": Sensormodel.sensorname,
        "datatype": Sensormodel.datatype,
        "position": Sensormodel.position,
        "value": Sensormodel.value,
        "date": Sensormodel.date
    }