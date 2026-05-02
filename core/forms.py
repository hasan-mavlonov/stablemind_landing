from django import forms
from django.contrib.auth.models import User
from .models import Application


class ApplicationForm(forms.ModelForm):
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
