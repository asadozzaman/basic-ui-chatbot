from django.urls import path
from . import views

urlpatterns = [
    path('', views.map_view, name='map_view'),
    path('save-shape/', views.save_shape, name='save_shape'),
    path('get-shapes/', views.get_shapes, name='get_shapes'),
    path('parcels/', views.get_parcels, name='parcels'),
    path('delete-shape/<int:parcel_id>/', views.delete_shape, name='delete_shape'),
    path('analyze/', views.upload_and_analyze, name='upload_and_analyze'),
]