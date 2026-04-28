from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from core.views import landing_page, careers_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', landing_page, name='landing'),
    path('careers/', careers_page, name='careers'),
]

# IMPORTANT: serve media on Render (works even in production single-instance)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)