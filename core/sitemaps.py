from django.contrib.sitemaps import Sitemap
from django.urls import reverse


class StaticPagesSitemap(Sitemap):
    """The public pages. Served at /sitemap.xml and listed in /robots.txt."""

    protocol = "https"  # the site is HTTPS-only

    def items(self):
        return ["landing", "research_paper", "careers", "mindform_demo"]

    def location(self, item):
        return reverse(item)
