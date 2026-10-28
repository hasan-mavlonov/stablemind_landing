from pathlib import Path

from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "role", "created_at", "cv")
    search_fields = ("name", "email", "github_or_experience", "motivation")
    list_filter = ("role", "created_at")
    exclude = ("resume",)                  # files on disk don't survive a deploy; see "cv"
    readonly_fields = ("cv",)

    def get_queryset(self, request):
        # Listing applications must not load every CV in full.
        return super().get_queryset(request).defer("resume_data")

    @admin.display(description="CV")
    def cv(self, application):
        if not application.has_resume:
            return "none"
        name = application.resume_name or Path(application.resume.name).name
        url = reverse("serve_application_resume", args=[application.pk])
        return format_html('<a href="{}">Download {}</a>', url, name)
