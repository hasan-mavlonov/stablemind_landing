from django import forms

from .models import Application


class ApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = ["name", "email", "role", "github_or_experience", "motivation"]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Ada Lovelace"}),
            "email": forms.EmailInput(attrs={"placeholder": "you@domain.com"}),
            "github_or_experience": forms.TextInput(
                attrs={
                    "placeholder": "GitHub profile, publications, or equivalent experience",
                }
            ),
            "motivation": forms.Textarea(
                attrs={
                    "rows": 6,
                    "placeholder": "Tell us what problem you want to help solve and why.",
                }
            ),
        }
        labels = {
            "github_or_experience": "GitHub / research links / experience (optional)",
        }
