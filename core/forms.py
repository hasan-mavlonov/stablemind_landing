from pathlib import Path

from django import forms
from django.contrib.auth.models import User
from .models import Application

# Resume uploads: the file's first bytes must match its extension, so a renamed HTML or
# script file can't be stored as a "resume".
RESUME_SIGNATURES = {
    ".pdf": (b"%PDF-",),
    ".doc": (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",),   # legacy Word (OLE2)
    ".docx": (b"PK\x03\x04",),                         # Office Open XML (zip)
}
MAX_RESUME_BYTES = 10 * 1024 * 1024


class ApplicationForm(forms.ModelForm):
    def clean_resume(self):
        resume = self.cleaned_data.get("resume")
        if not resume or not hasattr(resume, "read"):
            return resume

        signatures = RESUME_SIGNATURES.get(Path(resume.name).suffix.lower())
        if signatures is None:
            raise forms.ValidationError("Please upload a PDF, DOC or DOCX file.")
        if resume.size > MAX_RESUME_BYTES:
            raise forms.ValidationError("Please keep the file under 10 MB.")

        head = resume.read(8)
        resume.seek(0)
        if not head.startswith(signatures):
            raise forms.ValidationError("That file doesn't look like a valid PDF, DOC or DOCX.")
        return resume

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
    confirm_password = forms.CharField(widget=forms.PasswordInput)

    def clean_username(self):
        return self.cleaned_data["username"].strip()

    def username_exists(self):
        username = self.cleaned_data.get("username", "")
        return User.objects.filter(username=username).exists()
