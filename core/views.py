from django.shortcuts import redirect, render
from django.urls import reverse
import os
from django.http import FileResponse, Http404
from django.conf import settings

from .forms import ApplicationForm


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
