from django.conf import settings


def contact_details():
    """The footer's contact path. LinkedIn and WeChat stay empty (hidden) until configured."""
    linkedin = settings.LINKEDIN_URL if settings.LINKEDIN_URL.startswith("https://") else ""
    return {"email": settings.CONTACT_EMAIL, "linkedin": linkedin, "wechat": settings.WECHAT_ID}


def site_contact(request):
    return {"site_contact": contact_details()}
