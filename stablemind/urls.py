from django.contrib import admin
from django.urls import path
from core.views import landing_page, careers_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', landing_page, name='landing'),
    path('careers/', careers_page, name='careers'),
]
