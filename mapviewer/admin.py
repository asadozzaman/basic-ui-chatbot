
from django.contrib import admin
from .models import Parcel

@admin.register(Parcel)
class ParcelAdmin(admin.ModelAdmin):
    list_display = ('name', 'area')
    search_fields = ('name',)
    list_filter = ('area',)
