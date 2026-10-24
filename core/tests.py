import contextvars
import hashlib
import importlib.util
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import types
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest import mock, skipUnless

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.staticfiles import finders
from django.core.files.uploadedfile import SimpleUploadedFile
from django.http import Http404
from django.template.loader import render_to_string
from django.templatetags.static import static
from django.test import RequestFactory, TestCase, override_settings
from django.urls import reverse

from . import content, mindform_demo
from .forms import ApplicationForm
from .mindform_engine import llm
from .mindform_engine import reply as engine_reply
from .views import serve_resume

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
        self.assertContains(response, "MindForm is a member of the")
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

    def test_no_css_filter_can_touch_the_badge_or_logos(self):
        # Exhibit B: "The colors built into the badge must not be changed or adjusted."
        html = self.get("landing").content.decode()
        self.assertNotIn("grayscale", html)
        self.assertIsNone(re.search(
            r"\.(proof-media|proof-logo|fit-badge|inception-badge)[^{}]*\{[^}]*\bfilter\s*:", html))

    def test_membership_is_never_worded_as_endorsement(self):
        # Exhibit B / section 2(c): nothing may imply NVIDIA endorses or provides our
        # product. The bundle is checked too, since the landing copy lives there.
        bundle = Path(finders.find("core/js/landing.bundle.js")).read_text(encoding="utf-8")
        pages = [self.get(name).content.decode() for name in ("landing", *BASE_TEMPLATE_PAGES)]
        for text in (bundle, *pages):
            lowered = text.lower()
            for phrase in ("backed by nvidia", "powered by nvidia", "nvidia partner", "endorsed by nvidia", "certified by nvidia"):
                self.assertNotIn(phrase, lowered)


def _run_in_fresh_process(code, **env):
    """Run Python code in a new interpreter with exactly these setting overrides.

    Settings are read once at import, so DEBUG/ALLOWED_HOSTS logic can only be exercised
    from a clean process. Every relevant variable is passed explicitly (even as "") so a
    developer's .env can't leak in: python-dotenv never overrides variables already set.
    """
    base = {"DEBUG": "", "ALLOWED_HOSTS": "", "CSRF_TRUSTED_ORIGINS": "",
            "RENDER_EXTERNAL_HOSTNAME": "", "SECRET_KEY": "test-only",
            "SECURE_HSTS_SECONDS": "", "DEMO_TURN_BUDGET_SECONDS": ""}
    proc_env = {**os.environ, **base, **env, "DJANGO_SETTINGS_MODULE": "stablemind.settings"}
    return subprocess.run([sys.executable, "-c", code], cwd=settings.BASE_DIR, env=proc_env,
                          capture_output=True, text=True, check=True)


def _settings_in_fresh_process(**env):
    """The settings a new interpreter ends up with under these environment overrides."""
    code = ("import json, stablemind.settings as s; "
            "print(json.dumps({'DEBUG': s.DEBUG, 'ALLOWED_HOSTS': s.ALLOWED_HOSTS, "
            "'SECURE_HSTS_SECONDS': getattr(s, 'SECURE_HSTS_SECONDS', None), "
            "'DEMO_TURN_BUDGET_SECONDS': s.DEMO_TURN_BUDGET_SECONDS}))")
    out = _run_in_fresh_process(code, **env)
    return json.loads(out.stdout.strip().splitlines()[-1])


class DebugAndHostsTests(TestCase):
    def test_debug_defaults_to_off(self):
        self.assertFalse(_settings_in_fresh_process()["DEBUG"])

    def test_debug_works_for_local_development(self):
        result = _settings_in_fresh_process(DEBUG="True")
        self.assertTrue(result["DEBUG"])
        self.assertNotIn("mindform-ai.com", result["ALLOWED_HOSTS"])

    def test_debug_is_ignored_on_public_hosts(self):
        # The production incident: DEBUG=True left in the host's environment.
        result = _settings_in_fresh_process(DEBUG="True", ALLOWED_HOSTS="mindform-ai.com,www.mindform-ai.com")
        self.assertFalse(result["DEBUG"])

    def test_render_hostname_is_allowed_and_disables_debug(self):
        result = _settings_in_fresh_process(DEBUG="True", RENDER_EXTERNAL_HOSTNAME="mindform.onrender.com")
        self.assertFalse(result["DEBUG"])
        self.assertIn("mindform.onrender.com", result["ALLOWED_HOSTS"])
        # The public domain must survive the DEBUG guard, or the live site answers 400.
        self.assertIn("mindform-ai.com", result["ALLOWED_HOSTS"])
        self.assertIn("www.mindform-ai.com", result["ALLOWED_HOSTS"])

    def test_production_defaults_serve_the_public_domain(self):
        result = _settings_in_fresh_process()
        self.assertFalse(result["DEBUG"])
        for host in ("mindform-ai.com", "www.mindform-ai.com"):
            self.assertIn(host, result["ALLOWED_HOSTS"])

    def test_empty_or_invalid_numbers_fall_back_instead_of_crashing(self):
        result = _settings_in_fresh_process(SECURE_HSTS_SECONDS="", DEMO_TURN_BUDGET_SECONDS="soon")
        self.assertEqual(result["SECURE_HSTS_SECONDS"], 3600)
        self.assertEqual(result["DEMO_TURN_BUDGET_SECONDS"], 25.0)

    def test_server_errors_reach_the_log_with_debug_off(self):
        # Django's default console handler only prints with DEBUG on; production must still
        # see a 500's traceback in its logs.
        out = _run_in_fresh_process(
            "import django, logging; django.setup(); "
            "logging.getLogger('django.request').error('server-error-marker')")
        self.assertIn("server-error-marker", out.stderr)

    def test_wildcard_host_is_replaced_in_production(self):
        result = _settings_in_fresh_process(ALLOWED_HOSTS="*")
        self.assertNotIn("*", result["ALLOWED_HOSTS"])
        self.assertIn("mindform-ai.com", result["ALLOWED_HOSTS"])

    def test_unknown_page_uses_the_site_404_without_debug_details(self):
        response = self.client.get("/no-such-page/", secure=True)
        self.assertEqual(response.status_code, 404)
        self.assertTemplateUsed(response, "404.html")
        self.assertContains(response, "This page doesn", status_code=404)
        self.assertNotContains(response, "media/resumes", status_code=404)

    def test_500_page_renders_without_a_request(self):
        html = render_to_string("500.html")
        self.assertIn("Something went", html)


class ResumePrivacyTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, ignore_errors=True)
        os.makedirs(os.path.join(self.media, "resumes"))
        with open(os.path.join(self.media, "resumes", "ada.pdf"), "wb") as fh:
            fh.write(b"%PDF-1.4 test")
        self.url = reverse("serve_resume", args=["ada.pdf"])

    def test_anonymous_visitors_cannot_download_resumes(self):
        with override_settings(MEDIA_ROOT=self.media):
            response = self.client.get(self.url, secure=True)
        self.assertEqual(response.status_code, 302)
        self.assertIn("/admin/login/", response["Location"])

    def test_non_staff_users_cannot_download_resumes(self):
        User.objects.create_user("visitor", password="pw-12345-long")
        self.client.login(username="visitor", password="pw-12345-long")
        with override_settings(MEDIA_ROOT=self.media):
            response = self.client.get(self.url, secure=True)
        self.assertEqual(response.status_code, 302)

    def test_staff_get_the_file_as_an_attachment(self):
        User.objects.create_user("staff", password="pw-12345-long", is_staff=True)
        self.client.login(username="staff", password="pw-12345-long")
        with override_settings(MEDIA_ROOT=self.media):
            response = self.client.get(self.url, secure=True)
            body = b"".join(response.streaming_content)
        self.assertEqual(response.status_code, 200)
        self.assertIn("attachment", response["Content-Disposition"])
        self.assertEqual(body, b"%PDF-1.4 test")

    def test_paths_outside_the_resumes_folder_are_refused(self):
        staff = User.objects.create_user("staff2", password="pw-12345-long", is_staff=True)
        request = RequestFactory().get("/")
        request.user = staff
        with override_settings(MEDIA_ROOT=self.media):
            for name in ("..", ".", "missing.pdf"):
                with self.subTest(name=name), self.assertRaises(Http404):
                    serve_resume(request, name)


class ResumeUploadValidationTests(TestCase):
    def form_with(self, filename, content):
        data = {"name": "Ada", "email": "ada@example.com", "role": "other", "motivation": "Hi"}
        return ApplicationForm(data=data, files={"resume": SimpleUploadedFile(filename, content)})

    def test_real_documents_are_accepted(self):
        for filename, content in (("cv.pdf", b"%PDF-1.7 ..."), ("cv.docx", b"PK\x03\x04..."),
                                  ("cv.doc", b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1...")):
            with self.subTest(filename=filename):
                self.assertTrue(self.form_with(filename, content).is_valid())

    def test_other_file_types_are_rejected(self):
        for filename, content in (("cv.html", b"<script>alert(1)</script>"),
                                  ("cv.pdf", b"<html>not a pdf</html>"),
                                  ("cv.svg", b"<svg onload=alert(1)>")):
            with self.subTest(filename=filename):
                form = self.form_with(filename, content)
                self.assertFalse(form.is_valid())
                self.assertIn("resume", form.errors)

    def test_oversized_files_are_rejected(self):
        form = self.form_with("cv.pdf", b"%PDF-" + b"0" * (10 * 1024 * 1024))
        self.assertFalse(form.is_valid())


class _TempDemoStore:
    """Keep the demo's per-visitor character stores out of the repo during tests."""

    def setUp(self):
        super().setUp()
        data_home = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, data_home, ignore_errors=True)
        patcher = mock.patch.object(mindform_demo, "_DATA_HOME", data_home)
        patcher.start()
        self.addCleanup(patcher.stop)

    def turn(self, message="I lost my job today."):
        self.client.get(reverse("mindform_demo"), secure=True)   # session + starter characters
        return self.client.post("/demo/api/turn", data=json.dumps({"name": "Aisha", "message": message}),
                                content_type="application/json", secure=True)


def _hanging_openai(max_retries_seen, timeouts_seen):
    """A stand-in `openai` package whose model never answers: every call waits out its timeout."""
    def create(*, timeout, **kwargs):
        timeouts_seen.append(timeout)
        time.sleep(timeout)
        raise TimeoutError("fake model timed out")

    class OpenAI:
        def __init__(self, *, api_key, base_url, max_retries):
            max_retries_seen.append(max_retries)
            self.chat = types.SimpleNamespace(completions=types.SimpleNamespace(create=create))

    module = types.ModuleType("openai")
    module.OpenAI = OpenAI
    return module


class _SilentModelServer:
    """A local endpoint that accepts chat-completion requests and never answers them."""

    def __init__(self):
        self.requests = 0
        self.release = threading.Event()
        outer = self

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                outer.requests += 1
                outer.release.wait(15)

            def log_message(self, *args):
                pass

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.server.daemon_threads = True
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.server.server_address[1]}/v1/"

    def close(self):
        self.release.set()
        self.server.shutdown()
        self.server.server_close()


class LlmTimeBudgetTests(TestCase):
    def test_without_a_budget_calls_keep_their_own_timeout(self):
        self.assertEqual(llm.call_timeout(20), 20)

    def test_a_budget_caps_each_call_and_then_refuses_new_ones(self):
        with llm.time_budget(5):
            self.assertLessEqual(llm.call_timeout(20), 5)
        with llm.time_budget(llm.MIN_CALL_SECONDS / 2), self.assertRaises(TimeoutError):
            llm.call_timeout(20)

    def test_the_budget_follows_work_handed_to_worker_threads(self):
        # run_turn fans three LLM calls out to a thread pool; each task runs in a copy of
        # the request's context so the budget applies there too.
        with llm.time_budget(5), ThreadPoolExecutor(max_workers=1) as pool:
            inherited = pool.submit(contextvars.copy_context().run, llm.call_timeout, 20).result()
        self.assertLessEqual(inherited, 5)


@override_settings(DEMO_TURN_BUDGET_SECONDS=2)
class DemoTurnBudgetTests(_TempDemoStore, TestCase):
    """The production 502s: with a slow or unreachable model a turn ran for minutes."""

    def setUp(self):
        super().setUp()
        for module in (llm, engine_reply):
            patcher = mock.patch.object(module, "LLM_API_KEY", "test-key")
            patcher.start()
            self.addCleanup(patcher.stop)

    def test_a_hanging_model_cannot_stall_a_turn(self):
        max_retries_seen, timeouts_seen = [], []
        with mock.patch.dict(sys.modules, {"openai": _hanging_openai(max_retries_seen, timeouts_seen)}):
            started = time.monotonic()
            response = self.turn()
            elapsed = time.monotonic() - started

        self.assertEqual(response.status_code, 200)
        # One 2s budget for the whole turn (a call in flight may overrun by its own timeout).
        self.assertLess(elapsed, 2 * 2 + 1.5)
        data = response.json()
        self.assertTrue(data["reply"])
        self.assertEqual(data["expression"]["source"], "rule")      # the offline voice answered
        self.assertTrue(timeouts_seen)                                # the model was tried...
        self.assertTrue(all(t <= 2 for t in timeouts_seen))           # ...never past the budget
        self.assertEqual(set(max_retries_seen), {0})                  # ...and never re-tried

    @override_settings(DEMO_TURN_BUDGET_SECONDS=3)
    def test_a_slow_model_still_writes_the_reply(self):
        # Each call takes 1s. Without a reserve, the appraisal and the formation calls would
        # use up the 3s budget and the reply would fall back to the rule voice.
        def create(*, timeout, messages, **kwargs):
            time.sleep(1.0)
            speaking = "Speak ONLY as yourself" in messages[0]["content"]
            text = "I hear you, and I'm still here." if speaking else "{}"
            return types.SimpleNamespace(choices=[types.SimpleNamespace(message=types.SimpleNamespace(content=text))])

        class OpenAI:
            def __init__(self, **kwargs):
                self.chat = types.SimpleNamespace(completions=types.SimpleNamespace(create=create))

        fake = types.ModuleType("openai")
        fake.OpenAI = OpenAI
        with mock.patch.dict(sys.modules, {"openai": fake}):
            response = self.turn()
        data = response.json()
        self.assertEqual(data["reply"], "I hear you, and I'm still here.")
        self.assertNotEqual(data["expression"]["source"], "rule")

    @skipUnless(importlib.util.find_spec("openai"), "the openai package is not installed")
    @override_settings(DEMO_TURN_BUDGET_SECONDS=3)
    def test_the_real_client_sends_one_request_and_gives_up_in_time(self):
        server = _SilentModelServer()
        self.addCleanup(server.close)
        with mock.patch.object(llm, "LLM_BASE_URL", server.url):
            started = time.monotonic()
            response = self.turn()
            elapsed = time.monotonic() - started

        self.assertEqual(response.status_code, 200)
        self.assertLess(elapsed, 3 * 2 + 1.5)
        # The SDK's default max_retries=2 would have sent this three times, waiting each out.
        self.assertEqual(server.requests, 1)


class DemoKillSwitchTests(_TempDemoStore, TestCase):
    @override_settings(DEMO_ENABLED=False, DEMO_RECORDING_URL="https://example.com/demo-recording")
    def test_switched_off_demo_shows_the_offline_page(self):
        response = self.client.get(reverse("mindform_demo"), secure=True)
        self.assertEqual(response.status_code, 503)
        self.assertContains(response, "Demo temporarily", status_code=503)
        self.assertContains(response, "Watch the recording", status_code=503)
        self.assertContains(response, "https://example.com/demo-recording", status_code=503)

    @override_settings(DEMO_ENABLED=False, DEMO_RECORDING_URL="")
    def test_recording_link_stays_hidden_until_configured(self):
        response = self.client.get(reverse("mindform_demo"), secure=True)
        self.assertNotContains(response, "Watch the recording", status_code=503)

    @override_settings(DEMO_ENABLED=False, DEMO_RECORDING_URL="javascript:alert(1)")
    def test_a_non_https_recording_link_is_ignored(self):
        response = self.client.get(reverse("mindform_demo"), secure=True)
        self.assertNotContains(response, "javascript:", status_code=503)

    @override_settings(DEMO_ENABLED=False)
    def test_switched_off_api_answers_503_the_console_understands(self):
        for method, url in (("get", "/demo/api/config"), ("post", "/demo/api/turn")):
            with self.subTest(url=url):
                response = getattr(self.client, method)(url, secure=True)
                self.assertEqual(response.status_code, 503)
                self.assertTrue(response.json()["offline"])

    def test_live_console_carries_the_offline_overlay(self):
        response = self.client.get(reverse("mindform_demo"), secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="demo-offline"')

    def test_engine_errors_never_reach_the_browser(self):
        self.client.get(reverse("mindform_demo"), secure=True)
        with mock.patch.object(mindform_demo.bridge, "load_snapshot",
                               side_effect=RuntimeError("/srv/app/mindform_data/secret")), \
                self.assertLogs("mindform.demo", level="ERROR") as logs, \
                self.assertLogs("django.request", level="ERROR"):
            response = self.client.get("/demo/api/state?name=Aisha", secure=True)
        self.assertEqual(response.status_code, 500)
        self.assertNotContains(response, "mindform_data", status_code=500)
        self.assertIn("mindform_data/secret", "\n".join(logs.output))   # details go to the log


class ShippedContentTests(TestCase):
    def test_every_content_file_passes_strict_validation(self):
        for name in content.SCHEMAS:
            with self.subTest(file=f"content/{name}.json"):
                content.load(name, strict=True)

    def test_todo_markers_never_reach_a_page(self):
        for name in ("landing", "research_paper"):
            with self.subTest(page=name):
                html = self.client.get(reverse(name), secure=True).content.decode()
                self.assertIsNone(re.search(r"\btodo\b", html, re.IGNORECASE))

    def test_logo_folders_never_hold_the_nvidia_badge(self):
        # Logos there are shown in grayscale until hover; the NVIDIA license forbids changing
        # the badge's colours, and the homepage already shows it once in the hero.
        for folder in ("recognition", "partners"):
            directory = Path(settings.BASE_DIR) / "core" / "static" / content.IMAGE_ROOT / folder
            for path in (directory.iterdir() if directory.is_dir() else ()):
                with self.subTest(file=path.name):
                    self.assertNotIn("nvidia", path.name.lower())
                    self.assertNotEqual(hashlib.sha256(path.read_bytes()).hexdigest(), BADGE_SHA256)


class ValidateContentCommandTests(TestCase):
    def test_shipped_files_pass_and_a_broken_one_fails_the_build(self):
        from django.core.management import CommandError, call_command
        call_command("validate_content", stdout=io.StringIO())
        broken = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, broken, ignore_errors=True)
        for name in content.SCHEMAS:
            (broken / f"{name}.json").write_text("[]", encoding="utf-8")
        (broken / "team.json").write_text('[{"name": "Ada", "rol": "Engineer"}]', encoding="utf-8")
        with mock.patch.object(content, "CONTENT_DIR", broken), self.assertRaises(CommandError):
            call_command("validate_content", stdout=io.StringIO())


class ContentLoaderTests(TestCase):
    def setUp(self):
        self.dir = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.dir, ignore_errors=True)
        patcher = mock.patch.object(content, "CONTENT_DIR", self.dir)
        patcher.start()
        self.addCleanup(patcher.stop)

    def write(self, name, data):
        text = data if isinstance(data, str) else json.dumps(data)
        (self.dir / f"{name}.json").write_text(text, encoding="utf-8")

    def test_a_broken_file_empties_its_section_instead_of_breaking_the_page(self):
        self.write("recognition", "{not json")
        with self.assertLogs("core.content", "ERROR"):
            self.assertEqual(content.load("recognition"), [])
        with self.assertRaises(content.ContentError):
            content.load("recognition", strict=True)
        response = self.client.get(reverse("landing"), secure=True)
        self.assertEqual(response.status_code, 200)

    def test_a_missing_file_counts_as_empty(self):
        with self.assertLogs("core.content", "WARNING"):
            self.assertEqual(content.load("press"), [])

    def test_todo_and_unsafe_values_are_dropped(self):
        self.write("recognition", [{"title": "Lab award", "status": "Member", "year": "TODO",
                                    "link": "javascript:alert(1)", "logo": "missing.svg"}])
        with self.assertLogs("core.content", "WARNING"):
            [item] = content.load("recognition")
        self.assertEqual((item["year"], item["link"], item["logo"]), ("", "", ""))

    def test_incomplete_items_are_skipped_and_typos_fail_strict_loading(self):
        self.write("partners", [{"name": "Lab", "type": "research"}, {"name": "No type"},
                                {"name": "Sponsor", "type": "sponsor"}])
        with self.assertLogs("core.content", "WARNING"):
            self.assertEqual([p["name"] for p in content.load("partners")], ["Lab"])
        self.write("team", [{"name": "Ada", "role": "Engineer", "linkk": "https://example.com"}])
        with self.assertRaises(content.ContentError):
            content.load("team", strict=True)

    def test_only_the_todo_marker_counts_as_unknown(self):
        for value in ("TODO", "TODO: year", "todo: ask Marc", "  Todo  "):
            self.assertEqual(content.known(value), "", value)
        for value in ("Todoist", "TODOS app", "Learn more"):
            self.assertEqual(content.known(value), value.strip(), value)

    def test_the_nvidia_badge_is_referenced_never_copied(self):
        self.write("recognition", [{"title": "NVIDIA Inception Program", "status": "Member",
                                    "logo": "nvidia-inception", "logo_fit": "cover"}])
        [item] = content.load("recognition", strict=True)
        self.assertEqual(item["logo"], static(BADGE))
        self.assertEqual(item["logo_fit"], "badge")          # never cropped to fill a frame
        # Partner cards can't use it: the license forbids presenting NVIDIA as a partner.
        self.write("partners", [{"name": "NVIDIA", "type": "industry", "logo": "nvidia-inception"}])
        with self.assertRaises(content.ContentError):
            content.load("partners", strict=True)

    def test_image_fit_defaults_to_contain_and_rejects_unknown_values(self):
        self.write("recognition", [{"title": "Award", "status": "Member", "logo": "gemma-4-banner.webp"}])
        [item] = content.load("recognition", strict=True)
        self.assertEqual(item["logo_fit"], "contain")
        self.write("recognition", [{"title": "Award", "status": "Member", "logo": "gemma-4-banner.webp",
                                    "logo_fit": "stretch"}])
        with self.assertRaises(content.ContentError):
            content.load("recognition", strict=True)
        with self.assertLogs("core.content", "WARNING"):
            [item] = content.load("recognition")
        self.assertEqual(item["logo_fit"], "contain")

    def test_dates_are_formatted_for_display(self):
        self.assertEqual(content.format_date("2026-06"), "Jun 2026")
        self.assertEqual(content.format_date("2026-08", "2026-10"), "Aug to Oct 2026")
        self.assertEqual(content.format_date("2025-11", "2026-02"), "Nov 2025 to Feb 2026")
        self.assertEqual(content.format_date("2026"), "2026")
        self.assertEqual(content.format_date("TODO"), "")


class ContentSectionTests(TestCase):
    """The sections render whatever the JSON holds; these tests don't pin the real content."""

    def setUp(self):
        self.dir = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.dir, ignore_errors=True)
        patcher = mock.patch.object(content, "CONTENT_DIR", self.dir)
        patcher.start()
        self.addCleanup(patcher.stop)
        for name in content.SCHEMAS:
            (self.dir / f"{name}.json").write_text("[]", encoding="utf-8")

    def write(self, name, data):
        (self.dir / f"{name}.json").write_text(json.dumps(data), encoding="utf-8")

    def landing(self):
        html = self.client.get(reverse("landing"), secure=True).content.decode()
        match = re.search(r'<script id="site-content" type="application/json">(.*?)</script>', html, re.S)
        return json.loads(match.group(1)), html

    def test_landing_hands_the_lists_to_the_page_and_its_noscript_copy(self):
        self.write("recognition", [{"title": "Example Program", "status": "Accepted · offer declined",
                                    "description": "Picked from many."}])
        self.write("team", [{"name": "Ada Lovelace", "role": "Engineer"}])
        data, html = self.landing()
        self.assertEqual(data["recognition"][0]["status"], "Accepted · offer declined")
        self.assertEqual(data["team"][0]["name"], "Ada Lovelace")
        self.assertIn("<strong>Example Program</strong>: Accepted · offer declined.", html)
        self.assertIn("<strong>Ada Lovelace</strong>: Engineer", html)

    def test_empty_partners_show_the_onboarding_message_with_the_configured_email(self):
        with override_settings(PARTNERS_EMAIL="design@example.com"):
            data, html = self.landing()
        self.assertEqual(data["partners"], [])
        self.assertEqual(data["partnersEmail"], "design@example.com")
        self.assertIn("We're onboarding our first design partners in companion AI, robotics and games.", html)
        self.assertIn("mailto:design@example.com", html)

    def test_press_and_advisors_stay_out_of_the_page_until_listed(self):
        _, html = self.landing()
        self.assertNotIn("<h2>Press</h2>", html)
        self.assertNotIn("<h3>Advisors</h3>", html)
        self.write("press", [{"outlet": "Example Times", "title": "A story", "date": "2026-09"}])
        _, html = self.landing()
        self.assertIn("<h2>Press</h2>", html)
        self.assertIn("Example Times", html)

    def test_research_page_benchmarks_and_milestones(self):
        self.write("milestones", [
            {"date": "2026-08", "date_end": "2026-10", "title": "Later"},
            {"date": "TODO", "title": "Undated"},
            {"date": "2026-06", "title": "Earlier", "link": "https://example.com/paper"},
        ])
        response = self.client.get(reverse("research_paper"), secure=True)
        self.assertContains(response, "Benchmark results coming soon.")
        html = response.content.decode()
        self.assertLess(html.index("Earlier"), html.index("Later"))          # time order
        self.assertLess(html.index("Later"), html.index("Undated"))          # unknown dates apart
        self.assertIn("Aug to Oct 2026", html)

        self.write("benchmarks", [{"benchmark": "Persona drift", "metric": "Score",
                                   "mindform_score": 0.91, "baseline": 0.62, "date": "2026-10"}])
        response = self.client.get(reverse("research_paper"), secure=True)
        self.assertNotContains(response, "Benchmark results coming soon.")
        self.assertContains(response, "Persona drift")
        self.assertContains(response, "0.91")


class AccuracyTests(TestCase):
    def test_research_page_describes_a_preprint_not_peer_review(self):
        response = self.client.get(reverse("research_paper"), secure=True)
        html = response.content.decode().lower()
        for claim in ("peer-reviewed", "peer reviewed", "human evaluation study"):
            self.assertNotIn(claim, html)
        self.assertIn("published as a preprint", html)
        self.assertContains(response, "https://doi.org/10.5281/zenodo.20827145")
        self.assertContains(response, "Nuo Chen, NUS")                 # endorsement line kept

    def test_body_copy_uses_the_mindform_brand_spelling(self):
        for name in ("landing", "research_paper", "careers"):
            with self.subTest(page=name):
                html = self.client.get(reverse(name), secure=True).content.decode()
                self.assertNotIn("Mindform Labs", html)
                self.assertIn("MindForm", html)


class FooterContactTests(TestCase):
    @override_settings(CONTACT_EMAIL="team@example.com", LINKEDIN_URL="", WECHAT_ID="")
    def test_contact_email_comes_from_settings_and_unset_channels_stay_hidden(self):
        response = self.client.get(reverse("research_paper"), secure=True)
        self.assertContains(response, 'href="mailto:team@example.com"')
        self.assertNotContains(response, "LinkedIn")
        self.assertNotContains(response, "WeChat")

    @override_settings(LINKEDIN_URL="https://www.linkedin.com/company/example", WECHAT_ID="example-id")
    def test_linkedin_and_wechat_appear_once_configured(self):
        response = self.client.get(reverse("careers"), secure=True)
        self.assertContains(response, 'href="https://www.linkedin.com/company/example"')
        self.assertContains(response, "WeChat: example-id")
        landing = self.client.get(reverse("landing"), secure=True).content.decode()
        match = re.search(r'<script id="site-content" type="application/json">(.*?)</script>', landing, re.S)
        contact = json.loads(match.group(1))["contact"]
        self.assertEqual(contact["linkedin"], "https://www.linkedin.com/company/example")
        self.assertEqual(contact["wechat"], "example-id")

    @override_settings(LINKEDIN_URL="javascript:alert(1)")
    def test_a_non_https_linkedin_value_is_ignored(self):
        response = self.client.get(reverse("careers"), secure=True)
        self.assertNotContains(response, "javascript:")


class SitemapAndRobotsTests(TestCase):
    def test_sitemap_lists_the_public_pages_over_https(self):
        response = self.client.get("/sitemap.xml", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/xml")
        for path in ("/", "/research-paper/", "/careers/", "/demo/"):
            self.assertContains(response, f"<loc>https://testserver{path}</loc>")
        self.assertNotContains(response, "/admin/")

    def test_robots_txt_points_to_the_sitemap(self):
        response = self.client.get("/robots.txt", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response["Content-Type"].startswith("text/plain"))
        body = response.content.decode()
        self.assertIn("Sitemap: https://testserver/sitemap.xml", body)
        for path in ("/admin/", "/media/", "/demo/api/"):
            self.assertIn(f"Disallow: {path}", body)
