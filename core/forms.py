import logging
from pathlib import Path

from django import forms
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import SuspiciousFileOperation
from django.db.models import Sum
from django.utils.text import get_valid_filename

from .models import Application

log = logging.getLogger("core.forms")

# Resume uploads: the file's first bytes must match its extension, so a renamed HTML or
# script file can't be stored as a "resume".
RESUME_SIGNATURES = {
    ".pdf": (b"%PDF-",),
    ".doc": (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",),   # legacy Word (OLE2)
    ".docx": (b"PK\x03\x04",),                         # Office Open XML (zip)
}
MAX_RESUME_BYTES = 10 * 1024 * 1024
PDF_HEADER_WINDOW = 1024


class ApplicationForm(forms.ModelForm):
    def clean_resume(self):
        resume = self.cleaned_data.get("resume")
        if not resume or not hasattr(resume, "read"):
            return resume

        suffix = Path(resume.name).suffix.lower()
        signatures = RESUME_SIGNATURES.get(suffix)
        if signatures is None:
            raise forms.ValidationError("Please upload a PDF, DOC or DOCX file.")
        if resume.size > MAX_RESUME_BYTES:
            raise forms.ValidationError("Please keep the file under 10 MB.")

        head = resume.read(PDF_HEADER_WINDOW)
        resume.seek(0)
        if suffix == ".pdf":
            # PDF readers accept the header anywhere in the first 1024 bytes, and some
            # exporters put a few bytes before it.
            valid = any(signature in head for signature in signatures)
        else:
            valid = head.startswith(signatures)
        if not valid:
            raise forms.ValidationError("That file doesn't look like a valid PDF, DOC or DOCX.")

        # CVs live in the database; a cap keeps a flood of uploads from filling it up and
        # taking every other write on the site down with it.
        stored = Application.objects.aggregate(total=Sum("resume_size"))["total"] or 0
        if stored + resume.size > settings.RESUME_STORAGE_LIMIT_MB * 1024 * 1024:
            log.warning("CV storage limit (%s MB) reached; upload refused", settings.RESUME_STORAGE_LIMIT_MB)
            raise forms.ValidationError(
                f"We can't take more files here right now. Please send your CV to "
                f"{settings.CONTACT_EMAIL} instead.")
        return resume

    def save(self, commit=True):
        """Keep the CV in the application row, never on the server's disk (Render wipes it)."""
        application = super().save(commit=False)
        upload = self.cleaned_data.get("resume")
        application.resume = None
        if upload:
            upload.seek(0)
            data = upload.read()
            application.resume_data = data
            try:
                application.resume_name = get_valid_filename(Path(upload.name).name)
            except SuspiciousFileOperation:             # nothing usable left of the name
                application.resume_name = "resume" + Path(upload.name).suffix.lower()
            application.resume_size = len(data)
        if commit:
            application.save()
        return application

    class Meta:
        model = Application
        fields = [
            "name",
            "email",
            "role",
            "github_or_experience",
            "referral_code",
            "resume",
            "motivation",
        ]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Ada Lovelace"}),
            "email": forms.EmailInput(attrs={"placeholder": "you@domain.com"}),
            "github_or_experience": forms.TextInput(
                attrs={"placeholder": "GitHub profile or experience"},
            ),
            "referral_code": forms.TextInput(attrs={"placeholder": "Optional referral code (e.g. 6FDO9G)", "maxlength": "6"}),
            "resume": forms.ClearableFileInput(attrs={"accept": ".pdf,.doc,.docx"}),
            "motivation": forms.Textarea(attrs={"rows": 6}),
        }


class AuthForm(forms.Form):
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)
    # Only needed when creating an account; the page tells returning users to leave it blank.
    confirm_password = forms.CharField(widget=forms.PasswordInput, required=False)

    def clean_username(self):
        return self.cleaned_data["username"].strip()

    def username_exists(self):
        username = self.cleaned_data.get("username", "")
        return User.objects.filter(username=username).exists()
