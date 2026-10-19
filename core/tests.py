import hashlib
from pathlib import Path

from django.contrib.staticfiles import finders
from django.templatetags.static import static
from django.test import TestCase
from django.urls import reverse

BADGE = "core/img/nvidia/nvidia-inception-program-badge-rgb-for-screen.svg"
# SHA-256 of for-screen/nvidia-inception-program-badge-rgb-for-screen.svg from NVIDIA's
# "Inception Badge for members" kit. Our NVIDIA trademark license (Exhibit B) forbids
# altering the badge, so a recolored, cropped or minified copy must fail here. If NVIDIA
# issues new artwork, replace the file with theirs and update this hash.
BADGE_SHA256 = "d2f1fc25616ba02933506b21fa668289169e58ac4c76b5f7f209f2632f289f2e"
TRADEMARK_NOTICE = (
    "NVIDIA, the NVIDIA logo and NVIDIA Inception are trademarks and/or registered "
    "trademarks of NVIDIA Corporation in the U.S. and other countries."
)
# Pages rendered from base.html, whose footer carries the badge.
BASE_TEMPLATE_PAGES = ("careers", "research_paper", "login")


class NvidiaInceptionBadgeTests(TestCase):
    def get(self, name):
        # secure=True: with DEBUG off, settings force an HTTPS redirect.
        response = self.client.get(reverse(name), secure=True)
        self.assertEqual(response.status_code, 200)
        return response

    def test_badge_file_is_nvidias_unmodified_artwork(self):
        path = finders.find(BADGE)
        self.assertIsNotNone(path, f"{BADGE} is missing from static files")
        digest = hashlib.sha256(Path(path).read_bytes()).hexdigest()
        self.assertEqual(digest, BADGE_SHA256)

    def test_landing_page_hands_badge_to_bundle_and_noscript_fallback(self):
        response = self.get("landing")
        self.assertContains(response, f'nvidiaInceptionBadge: "{static(BADGE)}"')
        self.assertContains(response, "Mindform is a member of the")
        self.assertContains(response, TRADEMARK_NOTICE)

    def test_base_template_pages_show_badge_once_with_trademark_notice(self):
        for name in BASE_TEMPLATE_PAGES:
            with self.subTest(page=name):
                response = self.get(name)
                # Exhibit B bars multiple NVIDIA logos without NVIDIA's written permission;
                # we read that as one badge per page.
                self.assertContains(response, static(BADGE), count=1)
                self.assertContains(response, 'alt="NVIDIA Inception Program"', count=1)
                self.assertContains(response, TRADEMARK_NOTICE, count=1)

    def test_membership_is_never_worded_as_endorsement(self):
        # Exhibit B / section 2(c): nothing may imply NVIDIA endorses or provides our
        # product. The bundle is checked too, since the landing copy lives there.
        bundle = Path(finders.find("core/js/landing.bundle.js")).read_text(encoding="utf-8")
        pages = [self.get(name).content.decode() for name in ("landing", *BASE_TEMPLATE_PAGES)]
        for text in (bundle, *pages):
            lowered = text.lower()
            for phrase in ("backed by nvidia", "powered by nvidia", "nvidia partner", "endorsed by nvidia", "certified by nvidia"):
                self.assertNotIn(phrase, lowered)
