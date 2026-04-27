from django.contrib import admin

from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "role", "created_at")
    search_fields = ("name", "email", "github_or_experience", "motivation")
    list_filter = ("role", "created_at")
