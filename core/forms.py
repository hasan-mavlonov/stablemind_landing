from django import forms
from .models import Application


class ApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = [
            "name",
            "email",
            "role",
            "github_or_experience",
            "resume",
            "motivation",
        ]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Ada Lovelace"}),
            "email": forms.EmailInput(attrs={"placeholder": "you@domain.com"}),
            "github_or_experience": forms.TextInput(
                attrs={"placeholder": "GitHub profile or experience"},
            ),
            "resume": forms.ClearableFileInput(attrs={"accept": ".pdf,.doc,.docx"}),
            "motivation": forms.Textarea(attrs={"rows": 6}),
        }