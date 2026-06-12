from django.contrib import admin
from django.urls import path

from core.views import (
    landing_page,
    careers_page,
    serve_resume,
    research_paper_page,
    auth_page,
    logout_page,
    profile_page,
)
from core import mindform_demo

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', landing_page, name='landing'),
    path('careers/', careers_page, name='careers'),
    path('research-paper/', research_paper_page, name='research_paper'),

    # MindForm interactive demo (the personality engine, vendored from mindform_v0).
    path('demo/', mindform_demo.console, name='mindform_demo'),
    path('demo/api/config', mindform_demo.api_config),
    path('demo/api/characters', mindform_demo.api_characters),
    path('demo/api/state', mindform_demo.api_state),
    path('demo/api/select', mindform_demo.api_select),
    path('demo/api/turn', mindform_demo.api_turn),
    path('demo/api/create/genesis', mindform_demo.api_create_genesis),
    path('demo/api/create/manual', mindform_demo.api_create_manual),

    path('media/resumes/<str:filename>/', serve_resume),

    path('accounts/login/', auth_page, name='login'),
    path('accounts/logout/', logout_page, name='logout'),
    path('accounts/profile/', profile_page, name='profile'),
]
