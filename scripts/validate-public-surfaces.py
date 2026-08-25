"""Parse curated public data surfaces without executing repository content."""

from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

import yaml


ROOT = Path(__file__).resolve().parent.parent


class HTMLCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.errors = []
        self.has_title = False
        self.h1_count = 0

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if "id" in attributes:
            if attributes["id"] in self.ids:
                self.errors.append(f"duplicate id {attributes['id']}")
            self.ids.add(attributes["id"])
        if tag == "a" and "href" in attributes:
            self.links.append(attributes["href"])
        if tag == "title":
            self.has_title = True
        if tag == "h1":
            self.h1_count += 1


html_files = [
    "index.html",
    "404.html",
    "agency-declaration/index.html",
    "feedback/index.html",
]

for relative_path in html_files:
    check = HTMLCheck()
    check.feed((ROOT / relative_path).read_text(encoding="utf-8"))
    if not check.has_title:
        check.errors.append("missing title")
    if check.h1_count != 1:
        check.errors.append(f"expected one h1, found {check.h1_count}")
    for link in check.links:
        if link.startswith("#") and link[1:] not in check.ids:
            check.errors.append(f"missing anchor {link}")
    if check.errors:
        raise SystemExit(f"{relative_path}: {'; '.join(check.errors)}")

ET.parse(ROOT / "sitemap.xml")

yaml_files = [
    "readme.yawn",
    "yawn.yawn",
    "core/world-field-arena.yawn",
    "core/holarchy.yawn",
    "core/turn.yawn",
    "core/routing.yawn",
    "core/objective-holon.yawn",
    "core/projection-and-aperture.yawn",
    "templates/arena.yawn",
    "templates/turn.yawn",
    "templates/routing-proposal.yawn",
    "templates/structural-change-receipt.yawn",
    "templates/objective-holon.yawn",
    "examples/nested-agent-arena.yawn",
    "examples/waiting-turn.yawn",
    "examples/conversation-import-routing.yawn",
    "examples/merge-split-routing.yawn",
    "examples/dave-good-dad-objective-holon.yawn",
    "interface/objective-compiler.yawn",
    "question-packets/orientation-nine.yawn",
    "question-packets/turn-close.yawn",
    "CITATION.cff",
    ".github/ISSUE_TEMPLATE/bug.yml",
    ".github/ISSUE_TEMPLATE/spec-proposal.yml",
    ".github/workflows/ci.yml",
]

for relative_path in yaml_files:
    yaml.safe_load((ROOT / relative_path).read_text(encoding="utf-8"))

print(
    f"Parsed {len(html_files)} HTML routes, sitemap.xml, and "
    f"{len(yaml_files)} public YAML/Yawn surfaces."
)
