import uuid
from django.shortcuts import redirect, render
from django.urls import reverse
from django.conf import settings

from supabase import create_client
from .forms import ApplicationForm


# Initialize Supabase client
supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)


def landing_page(request):
    return render(request, "core/landing.html")


def upload_resume_to_supabase(file):
    """
    Upload file to Supabase Storage and return public URL
    """

    file_ext = file.name.split(".")[-1]
    file_name = f"resumes/{uuid.uuid4()}.{file_ext}"

    # Upload to bucket "resumes"
    supabase.storage.from_("resumes").upload(
        file_name,
        file.read(),
        {
            "content-type": file.content_type
        }
    )

    # Get public URL
    public_url = supabase.storage.from_("resumes").get_public_url(file_name)

    return public_url


def careers_page(request):
    if request.method == "POST":
        form = ApplicationForm(request.POST, request.FILES)

        if form.is_valid():
            obj = form.save(commit=False)

            resume_file = request.FILES.get("resume")

            if resume_file:
                obj.resume = upload_resume_to_supabase(resume_file)
            else:
                obj.resume = ""

            obj.save()

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