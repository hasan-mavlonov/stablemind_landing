from django.db import models
from django.contrib.auth.models import User
import random
import string


class Application(models.Model):
    ROLE_CHOICES = [
        ("ai_ml_research", "AI/ML Research"),
        ("agent_engineering", "Agent Engineering"),
        ("cognitive_modeling", "Cognitive Modeling"),
        ("infrastructure", "Research Infrastructure"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField()
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    motivation = models.TextField()
    github_or_experience = models.CharField(max_length=500, blank=True)
    referral_code = models.CharField(max_length=6, blank=True)

    # SIMPLE AND SAFE
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    referral_code = models.CharField(max_length=6, unique=True, editable=False)

    def __str__(self):
        return f"{self.user.username} - {self.referral_code}"

    @staticmethod
    def generate_referral_code():
        alphabet = string.ascii_uppercase + string.digits
        while True:
            code = "".join(random.choices(alphabet, k=6))
            if not UserProfile.objects.filter(referral_code=code).exists():
                return code

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = self.generate_referral_code()
        super().save(*args, **kwargs)
