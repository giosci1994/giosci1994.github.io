#!/usr/bin/env python3
"""Unit tests for scripts/update_projects.py (offline, stdlib unittest only)."""

from __future__ import annotations

import io
import json
import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent))

import update_projects as up  # noqa: E402


class FakeResponse:
    """Minimal context-manager mock for urllib.request.urlopen."""

    def __init__(self, payload: object, headers: dict[str, str] | None = None) -> None:
        self._body = json.dumps(payload).encode("utf-8")
        self.headers = headers or {}

    def read(self) -> bytes:
        return self._body

    def __enter__(self) -> "FakeResponse":
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        return False


def make_gql_repo(
    name: str,
    *,
    topics: list[str] | None = None,
    language: str | None = "Python",
    spdx: str | None = "GPL-3.0",
    lic_name: str | None = "GNU General Public License v3.0",
    homepage: str | None = None,
    pushed_at: str = "2026-11-22T10:00:00Z",
    custom_og: bool = True,
    og_url: str | None = None,
    is_private: bool = False,
    is_archived: bool = False,
    is_disabled: bool = False,
    is_fork: bool = False,
    is_template: bool = False,
) -> dict:
    return {
        "name": name,
        "description": f"Description for {name}",
        "url": f"https://github.com/giosci1994/{name}",
        "homepageUrl": homepage,
        "isPrivate": is_private,
        "isArchived": is_archived,
        "isDisabled": is_disabled,
        "isFork": is_fork,
        "isTemplate": is_template,
        "pushedAt": pushed_at,
        "usesCustomOpenGraphImage": custom_og,
        "openGraphImageUrl": og_url or f"https://repository-images.githubusercontent.com/1/{name}",
        "primaryLanguage": {"name": language} if language else None,
        "licenseInfo": {"key": (spdx or "").lower(), "name": lic_name, "spdxId": spdx}
        if (spdx or lic_name)
        else None,
        "repositoryTopics": {
            "nodes": [{"topic": {"name": t}} for t in (topics or [])]
        },
    }


def make_rest_repo(
    name: str,
    *,
    topics: list[str] | None = None,
    language: str | None = "Python",
    spdx: str | None = "GPL-3.0",
    lic_name: str | None = "GNU General Public License v3.0",
    homepage: str | None = None,
    has_pages: bool = False,
    pushed_at: str = "2026-11-22T10:00:00Z",
    private: bool = False,
    archived: bool = False,
    disabled: bool = False,
    fork: bool = False,
    is_template: bool = False,
) -> dict:
    return {
        "name": name,
        "description": f"REST {name}",
        "html_url": f"https://github.com/giosci1994/{name}",
        "homepage": homepage,
        "has_pages": has_pages,
        "private": private,
        "archived": archived,
        "disabled": disabled,
        "fork": fork,
        "is_template": is_template,
        "pushed_at": pushed_at,
        "language": language,
        "license": {"spdx_id": spdx, "name": lic_name} if (spdx or lic_name) else None,
        "topics": topics or [],
    }


class UpdateProjectsTests(unittest.TestCase):
    def test_topic_filter_exclusions_and_forks(self) -> None:
        repos = [
            make_gql_repo("showcase-ok", topics=["showcase", "windows"], pushed_at="2026-11-20T00:00:00Z"),
            make_gql_repo("fork-with-topic", topics=["showcase", "home-assistant"], is_fork=True, pushed_at="2026-11-21T00:00:00Z"),
            make_gql_repo("no-topic", topics=["windows"]),
            make_gql_repo("webapp-palestra", topics=["showcase", "react"]),
            make_gql_repo("floor3d-card", topics=["showcase", "home-assistant"], is_fork=True),
            make_gql_repo("giosci1994.github.io", topics=["showcase"]),
            make_gql_repo(".github", topics=["showcase"]),
            make_gql_repo("giosci1994", topics=["showcase"]),
            make_gql_repo("private-repo", topics=["showcase"], is_private=True),
            make_gql_repo("archived-repo", topics=["showcase"], is_archived=True),
            make_gql_repo("disabled-repo", topics=["showcase"], is_disabled=True),
            make_gql_repo("template-repo", topics=["showcase"], is_template=True),
        ]

        payload = up.build_projects_payload(repos, user="giosci1994", topic="showcase")
        names = [p["name"] for p in payload["projects"]]
        self.assertEqual(names, ["fork-with-topic", "showcase-ok"])
        self.assertNotIn("showcase", payload["projects"][0]["topics"])

    def test_include_repos_still_enforces_exclusions_and_safety(self) -> None:
        repos = [
            make_gql_repo("W11-cleaner-tool", topics=["windows", "gaming"], language="C#"),
            make_gql_repo("webapp-palestra", topics=["react"]),
            make_gql_repo("secret-tool", topics=[], is_private=True),
        ]
        payload = up.build_projects_payload(
            repos,
            include_repos={"W11-cleaner-tool", "webapp-palestra", "secret-tool"},
        )
        self.assertEqual([p["name"] for p in payload["projects"]], ["W11-cleaner-tool"])

    def test_macro_categories_and_fallback(self) -> None:
        self.assertEqual(
            up.classify_categories(["windows", "gaming", "wpf"], "C#"),
            ["Windows"],
        )
        self.assertEqual(
            up.classify_categories(["windows", "home-assistant", "mqtt"], "Python"),
            ["Windows", "Home Assistant"],
        )
        self.assertEqual(
            up.classify_categories(["nextjs", "pwa", "recipes"], "TypeScript"),
            ["Web App"],
        )
        self.assertEqual(
            up.classify_categories(["f1-25", "ps5", "pwa", "sim-racing"], "Python"),
            ["Gaming"],
        )
        self.assertEqual(
            up.classify_categories(["fan-translation", "pokemon"], "Python"),
            ["Gaming"],
        )
        self.assertEqual(
            up.classify_categories(["cli", "automation"], "Python"),
            ["Utility"],
        )

    def test_license_and_og_image_handling(self) -> None:
        repos = [
            make_gql_repo(
                "kitchen-app",
                topics=["showcase", "nextjs"],
                language="TypeScript",
                spdx="NOASSERTION",
                lic_name="Other",
                custom_og=True,
                og_url="https://repository-images.githubusercontent.com/123/abc",
            ),
            make_gql_repo(
                "generic-og",
                topics=["showcase"],
                language="Python",
                spdx="NOASSERTION",
                lic_name="PolyForm Noncommercial 1.0.0",
                custom_og=False,
                og_url="https://opengraph.githubassets.com/hash/user/generic-og",
            ),
        ]
        payload = up.build_projects_payload(repos)
        by_name = {p["name"]: p for p in payload["projects"]}

        self.assertIsNone(by_name["kitchen-app"]["license"])
        self.assertEqual(
            by_name["kitchen-app"]["image"],
            "https://repository-images.githubusercontent.com/123/abc",
        )
        self.assertEqual(by_name["generic-og"]["license"], "PolyForm Noncommercial 1.0.0")
        self.assertIsNone(by_name["generic-og"]["image"])

    def test_url_resolution_and_rest_parsing(self) -> None:
        repos = [
            make_rest_repo(
                "pages-only",
                topics=["showcase"],
                homepage="",
                has_pages=True,
                pushed_at="2026-11-20T00:00:00Z",
            ),
            make_rest_repo(
                "same-as-repo",
                topics=["showcase"],
                homepage="https://github.com/giosci1994/same-as-repo/",
                has_pages=False,
                pushed_at="2026-11-21T00:00:00Z",
            ),
            make_rest_repo(
                "custom-home",
                topics=["showcase"],
                homepage="https://example.com/app",
                has_pages=True,
                pushed_at="2026-11-22T00:00:00Z",
            ),
        ]
        payload = up.build_projects_payload(repos, user="giosci1994")
        by_name = {p["name"]: p for p in payload["projects"]}

        self.assertEqual(by_name["custom-home"]["url"], "https://example.com/app")
        self.assertIsNone(by_name["same-as-repo"]["url"])
        self.assertEqual(by_name["pages-only"]["url"], "https://giosci1994.github.io/pages-only/")
        self.assertIsNone(by_name["custom-home"]["image"])

    def test_sorting_pushed_at_desc_with_name_tiebreaker(self) -> None:
        repos = [
            make_gql_repo("zeta", topics=["showcase"], pushed_at="2026-11-20T10:00:00Z"),
            make_gql_repo("alpha", topics=["showcase"], pushed_at="2026-11-20T10:00:00Z"),
            make_gql_repo("newest", topics=["showcase"], pushed_at="2026-11-22T10:00:00Z"),
            make_gql_repo("Beta", topics=["showcase"], pushed_at="2026-11-20T10:00:00Z"),
        ]
        payload = up.build_projects_payload(repos)
        self.assertEqual(
            [p["name"] for p in payload["projects"]],
            ["newest", "alpha", "Beta", "zeta"],
        )

    def test_graphql_pagination_and_rest_link_pagination(self) -> None:
        gql_page1 = {
            "data": {
                "user": {
                    "repositories": {
                        "pageInfo": {"hasNextPage": True, "endCursor": "CUR1"},
                        "nodes": [make_gql_repo("repo-1", topics=["showcase"])],
                    }
                }
            }
        }
        gql_page2 = {
            "data": {
                "user": {
                    "repositories": {
                        "pageInfo": {"hasNextPage": False, "endCursor": None},
                        "nodes": [make_gql_repo("repo-2", topics=["showcase"])],
                    }
                }
            }
        }
        with mock.patch("urllib.request.urlopen", side_effect=[FakeResponse(gql_page1), FakeResponse(gql_page2)]):
            gql_repos = up.fetch_repos_graphql("giosci1994", "tok")
        self.assertEqual([r["name"] for r in gql_repos], ["repo-1", "repo-2"])

        rest_p1 = [make_rest_repo("rest-1", topics=["showcase"])]
        rest_p2 = [make_rest_repo("rest-2", topics=["showcase"])]
        link_header = '<https://api.github.com/users/giosci1994/repos?page=2>; rel="next"'
        with mock.patch(
            "urllib.request.urlopen",
            side_effect=[FakeResponse(rest_p1, {"Link": link_header}), FakeResponse(rest_p2)],
        ):
            rest_repos = up.fetch_repos_rest("giosci1994")
        self.assertEqual([r["name"] for r in rest_repos], ["rest-1", "rest-2"])


if __name__ == "__main__":
    unittest.main()
