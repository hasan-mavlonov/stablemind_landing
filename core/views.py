from pathlib import Path

import mimetypes

from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.http import FileResponse, Http404, HttpResponse
from django.utils.http import content_disposition_header
from django.conf import settings
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.decorators import login_required

from . import content
from .context_processors import contact_details
from .forms import ApplicationForm, AuthForm
from .models import Application, UserProfile


def landing_page(request):
    # Everything listed in these sections comes from content/*.json (see core/content.py).
    site_content = {
        "recognition": content.load("recognition"),
        "partners": content.load("partners"),
        "press": content.load("press"),
        "team": content.load("team"),
        "advisors": content.load("advisors"),
        "partnersEmail": settings.PARTNERS_EMAIL,
        "contact": contact_details(),
    }
    return render(request, "core/landing.html", {"site_content": site_content, **site_content})


def careers_page(request):
    if request.method == "POST":
        form = ApplicationForm(request.POST, request.FILES)

        if form.is_valid():
            form.save()
            return redirect(f"{reverse('careers')}?submitted=1")

    else:
        form = ApplicationForm()

    return render(
        request,
        "core/careers.html",
        {
            "form": form,
            "success": request.GET.get("submitted") == "1",
        },
    )

@staff_member_required
def serve_resume(request, filename):
    """Download an applicant's resume. Staff only: these are applicants' personal documents.

    Always served as an attachment, so an uploaded file can never render as a page on this
    domain, and only plain filenames inside MEDIA_ROOT/resumes resolve.
    """
    resumes_dir = (Path(settings.MEDIA_ROOT) / "resumes").resolve()
    path = (resumes_dir / filename).resolve()
    if path.parent != resumes_dir or path.name != filename or not path.is_file():
        raise Http404("File not found")

    return FileResponse(path.open("rb"), as_attachment=True, filename=path.name)


@staff_member_required
def serve_application_resume(request, pk):
    """Download the CV sent with an application. Staff only, always as an attachment."""
    application = get_object_or_404(
        Application.objects.only("resume", "resume_data", "resume_name"), pk=pk)
    if application.resume_data:
        name = application.resume_name or "resume"
        response = HttpResponse(bytes(application.resume_data),
                                content_type=mimetypes.guess_type(name)[0] or "application/octet-stream")
        response["Content-Disposition"] = content_disposition_header(True, name)
        response["Cache-Control"] = "private, no-store"
        return response
    if application.resume:                 # an older application whose file is on disk
        return serve_resume(request, Path(application.resume.name).name)
    raise Http404("No CV for this application")


def research_paper_page(request):
    milestones = content.load("milestones")
    return render(request, "core/research_paper.html", {
        "benchmarks": content.load("benchmarks"),
        # Dated milestones in time order; ones still marked TODO are listed apart, so the
        # page never implies an order we don't know.
        "milestones": sorted((m for m in milestones if m["date"]), key=lambda m: m["date"]),
        "undated_milestones": [m for m in milestones if not m["date"]],
    })


def auth_page(request):
    if request.user.is_authenticated:
        return redirect("profile")

    form = AuthForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        username = form.cleaned_data["username"]
        password = form.cleaned_data["password"]
        confirm_password = form.cleaned_data["confirm_password"]

        if User.objects.filter(username=username).exists():
            user = authenticate(request, username=username, password=password)
            if user is None:
                form.add_error("username", "Username exists. Please use the correct password to log in.")
            else:
                login(request, user)
                UserProfile.objects.get_or_create(user=user)
                messages.success(request, "Logged in.")
                return redirect("profile")
        else:
            try:
                validate_password(password, user=User(username=username))
            except ValidationError as error:
                form.add_error("password", error)
            if password != confirm_password:
                form.add_error("confirm_password", "Passwords do not match.")
            if form.is_valid():
                user = User.objects.create_user(username=username, password=password)
                login(request, user)
                UserProfile.objects.get_or_create(user=user)
                messages.success(request, "Account created.")
                return redirect("profile")

    return render(request, "core/login.html", {"form": form, "logged_in": False})


def logout_page(request):
    logout(request)
    messages.success(request, "Logged out.")
    return redirect("login")


@login_required
def profile_page(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return render(request, "core/profile.html", {"profile": profile})


def robots_txt(request):
    lines = [
        "User-agent: *",
        "Disallow: /admin/",
        "Disallow: /accounts/",
        "Disallow: /media/",
        "Disallow: /demo/api/",
        "",
        f"Sitemap: {request.build_absolute_uri(reverse('sitemap'))}",
    ]
    return HttpResponse("\n".join(lines) + "\n", content_type="text/plain")
