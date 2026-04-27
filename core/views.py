from django.shortcuts import redirect, render
from django.urls import reverse

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
            "success": request.method == "GET" and request.GET.get("submitted") == "1",
        },
    )
