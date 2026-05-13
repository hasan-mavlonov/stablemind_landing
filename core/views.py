from django.shortcuts import redirect, render
from django.urls import reverse
import os
from django.http import FileResponse, Http404
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from .forms import ApplicationForm, AuthForm
from .models import UserProfile


def landing_page(request):
    return render(request, "core/landing.html")


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

def serve_resume(request, filename):
    file_path = os.path.join(settings.MEDIA_ROOT, "resumes", filename)

    if not os.path.exists(file_path):
        raise Http404("File not found")

    return FileResponse(open(file_path, "rb"))


def research_paper_page(request):
    return render(request, "core/research_paper.html")


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
            if password != confirm_password:
                form.add_error("confirm_password", "Passwords do not match.")
            else:
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
