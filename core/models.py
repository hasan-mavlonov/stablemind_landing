from django.db import models


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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"
