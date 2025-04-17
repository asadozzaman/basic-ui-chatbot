

from django.db import models

class Parcel(models.Model):
    name = models.CharField(max_length=100)
    area = models.FloatField()
    geojson = models.TextField()

    def __str__(self):
        return self.name
