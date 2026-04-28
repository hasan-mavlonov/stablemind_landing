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

    try:
        file_ext = file.name.split(".")[-1]
        file_name = f"resumes/{uuid.uuid4()}.{file_ext}"

        # IMPORTANT: reset file pointer
        file.file.seek(0)
        file_content = file.file.read()

        # Upload file
        response = supabase.storage.from_("resumes").upload(
            file_name,
            file_content,
            {
                "content-type": file.content_type,
                "upsert": "true"
            }
        )

        print("SUPABASE UPLOAD RESPONSE:", response)

        # Generate public URL
        public_url = supabase.storage.from_("resumes").get_public_url(file_name)

        return public_url

    except Exception as e:
        print("SUPABASE UPLOAD ERROR:", str(e))
        return ""


def careers_page(request):
    if request.method == "POST":
        form = ApplicationForm(request.POST, request.FILES)

        if form.is_valid():
            obj = form.save(commit=False)

            resume_file = request.FILES.get("resume")

            if resume_file:
                uploaded_url = upload_resume_to_supabase(resume_file)

                if uploaded_url:
                    obj.resume = uploaded_url
                else:
                    obj.resume = ""
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
            "success": request.GET.get("submitted") == "1",
        },
    )