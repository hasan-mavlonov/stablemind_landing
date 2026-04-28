from django.contrib import admin
from django.urls import path


from core.views import landing_page, careers_page, serve_resume

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', landing_page, name='landing'),
    path('careers/', careers_page, name='careers'),

    # NEW
    path('media/resumes/<str:filename>/', serve_resume),
]