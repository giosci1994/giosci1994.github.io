#!/usr/bin/env python3
"""Fetch public repositories for a GitHub user and build assets/projects.json."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

API_BASE = "https://api.github.com"
GRAPHQL_URL = f"{API_BASE}/graphql"
EXCLUDED_REPOS = {
    ".github",
    "giosci1994",
    "giosci1994.github.io",
    "webapp-palestra",
    "floor3d-card",
}
NEXT_LINK_RE = re.compile(r'<([^>]+)>\s*;\s*rel=["\']next["\']')

WINDOWS_TOPICS = {
    "windows",
    "windows-11",
    "wpf",
    "winui",
    "powershell",
    "system-tray",
    "tray-app",
    "registry",
}
WINDOWS_LANGUAGES = {"C#", "PowerShell"}
HA_TOPICS = {
    "home-assistant",
    "hacs",
    "mqtt",
    "lovelace-ui",
    "esphome",
    "zigbee",
}
GAMING_TOPICS = {
    "sim-racing",
    "f1-25",
    "ps5",
    "race-engineer",
    "pokemon",
    "pokemon-essentials",
    "rpg-maker-xp",
    "mkxp-z",
    "fan-translation",
    "games",
    "videogames",
}
WEB_TOPICS = {
    "web-app",
    "webapp",
    "nextjs",
    "react",
    "vite",
    "pwa",
    "pwa-app",
    "pwa-apps",
    "frontend",
    "dashboard",
    "fullstack",
}
WEB_LANGUAGES = {"HTML", "CSS"}

GRAPHQL_QUERY = """
query($user: String!, $cursor: String) {
  user(login: $user) {
    repositories(
      first: 100
      after: $cursor
      privacy: PUBLIC
      ownerAffiliations: OWNER
      orderBy: { field: PUSHED_AT, direction: DESC }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        name
        description
        url
        homepageUrl
        isPrivate
        isArchived
        isDisabled
        isFork
        isTemplate
        pushedAt
        usesCustomOpenGraphImage
        openGraphImageUrl
        primaryLanguage {
          name
        }
        licenseInfo {
          key
          name
          spdxId
        }
        repositoryTopics(first: 30) {
          nodes {
            topic {
              name
            }
          }
        }
      }
    }
  }
}
""".strip()


def parse_next_link(link_header: str | None) -> str | None:
    """Extract the 'next' pagination URL from a GitHub REST Link header."""
    if not link_header:
        return None
    match = NEXT_LINK_RE.search(link_header)
    return match.group(1) if match else None


def is_http_url(value: str | None) -> bool:
    """Return True when value is an http(s) URL."""
    if not isinstance(value, str):
        return False
    stripped = value.strip()
    return stripped.startswith("https://") or stripped.startswith("http://")


def format_title(name: str) -> str:
    """Turn a repository slug into a clean human-readable title."""
    parts = [part for part in re.split(r"[-_\s]+", name.strip()) if part]
    if not parts:
        return name
    formatted = [
        part if part.isupper() else part[:1].upper() + part[1:]
        for part in parts
    ]
    return " ".join(formatted)


def resolve_license(license_info: dict | None) -> str | None:
    """Extract a clean license label, avoiding NOASSERTION / Other placeholders."""
    if not isinstance(license_info, dict):
        return None
    spdx = (license_info.get("spdxId") or license_info.get("spdx_id") or "").strip()
    if spdx and spdx not in {"NOASSERTION", "NONE"}:
        return spdx
    name = (license_info.get("name") or "").strip()
    if name and name not in {"Other", "NOASSERTION", "NONE"}:
        return name
    return None


def resolve_url(repo: dict, user: str) -> str | None:
    """Pick the best live/docs URL (homepage or GitHub Pages) when distinct from repo."""
    repo_url = (repo.get("repo") or "").strip()
    homepage = (repo.get("homepage") or "").strip()
    if is_http_url(homepage) and homepage.rstrip("/") != repo_url.rstrip("/"):
        return homepage
    if repo.get("has_pages") and repo.get("name"):
        pages_url = f"https://{user.lower()}.github.io/{repo['name']}/"
        if pages_url.rstrip("/") != repo_url.rstrip("/"):
            return pages_url
    return None


def classify_categories(topics: list[str], language: str | None) -> list[str]:
    """Map raw repository topics and language into 1-2 clean macro-categories."""
    topic_set = {topic.strip().lower() for topic in topics if isinstance(topic, str) and topic.strip()}
    lang = (language or "").strip()

    categories: list[str] = []
    if (topic_set & WINDOWS_TOPICS) or lang in WINDOWS_LANGUAGES:
        categories.append("Windows")
    if topic_set & HA_TOPICS:
        categories.append("Home Assistant")
    if (topic_set & GAMING_TOPICS) or ("gaming" in topic_set and "Windows" not in categories):
        categories.append("Gaming")
    if ((topic_set & WEB_TOPICS) or (lang in WEB_LANGUAGES and not categories)) and "Gaming" not in categories:
        categories.append("Web App")

    if not categories:
        categories.append("Utility")
    return categories[:2]


def normalize_repo(raw: dict) -> dict:
    """Normalize either a GraphQL repository node or a REST repository payload."""
    if "repositoryTopics" in raw or "usesCustomOpenGraphImage" in raw:
        topic_nodes = ((raw.get("repositoryTopics") or {}).get("nodes")) or []
        topics = [
            node["topic"]["name"].strip()
            for node in topic_nodes
            if isinstance(node, dict)
            and isinstance(node.get("topic"), dict)
            and isinstance(node["topic"].get("name"), str)
            and node["topic"]["name"].strip()
        ]
        lang_obj = raw.get("primaryLanguage")
        language = (
            lang_obj.get("name").strip()
            if isinstance(lang_obj, dict) and isinstance(lang_obj.get("name"), str)
            else None
        )
        og_url = (raw.get("openGraphImageUrl") or "").strip()
        image = og_url if raw.get("usesCustomOpenGraphImage") and is_http_url(og_url) else None
        return {
            "name": (raw.get("name") or "").strip(),
            "description": (raw.get("description") or "").strip(),
            "repo": (raw.get("url") or "").strip(),
            "homepage": (raw.get("homepageUrl") or "").strip(),
            "has_pages": bool(raw.get("hasPages", False)),
            "private": bool(raw.get("isPrivate", False)),
            "archived": bool(raw.get("isArchived", False)),
            "disabled": bool(raw.get("isDisabled", False)),
            "is_fork": bool(raw.get("isFork", False)),
            "is_template": bool(raw.get("isTemplate", False)),
            "pushed_at": raw.get("pushedAt") or None,
            "language": language or None,
            "license": resolve_license(raw.get("licenseInfo")),
            "topics": topics,
            "image": image,
        }

    topics = [
        topic.strip()
        for topic in (raw.get("topics") or [])
        if isinstance(topic, str) and topic.strip()
    ]
    language = raw.get("language")
    return {
        "name": (raw.get("name") or "").strip(),
        "description": (raw.get("description") or "").strip(),
        "repo": (raw.get("html_url") or "").strip(),
        "homepage": (raw.get("homepage") or "").strip(),
        "has_pages": bool(raw.get("has_pages", False)),
        "private": bool(raw.get("private", False)),
        "archived": bool(raw.get("archived", False)),
        "disabled": bool(raw.get("disabled", False)),
        "is_fork": bool(raw.get("fork", False)),
        "is_template": bool(raw.get("is_template", False)),
        "pushed_at": raw.get("pushed_at") or None,
        "language": language.strip() if isinstance(language, str) and language.strip() else None,
        "license": resolve_license(raw.get("license")),
        "topics": topics,
        "image": None,
    }


def is_eligible_repo(
    repo: dict,
    topic: str = "showcase",
    include_repos: set[str] | None = None,
) -> bool:
    """Return True when a repository should be included in assets/projects.json."""
    if (
        repo.get("private")
        or repo.get("archived")
        or repo.get("disabled")
        or repo.get("is_template")
    ):
        return False

    name = repo.get("name", "")
    if not name or name in EXCLUDED_REPOS:
        return False

    if include_repos:
        lowered_includes = {item.lower() for item in include_repos}
        if name in include_repos or name.lower() in lowered_includes:
            return True

    target_topic = topic.strip().lower()
    repo_topics = {t.lower() for t in (repo.get("topics") or []) if isinstance(t, str)}
    return target_topic in repo_topics


def extract_project(repo: dict, user: str, topic: str = "showcase") -> dict:
    """Convert a normalized repository dict into the output schema entry."""
    target_topic = topic.strip().lower()
    raw_topics = [
        t for t in (repo.get("topics") or [])
        if isinstance(t, str) and t.strip()
    ]
    filtered_topics = sorted({t.strip() for t in raw_topics if t.strip().lower() != target_topic})
    categories = classify_categories(filtered_topics, repo.get("language"))

    return {
        "name": repo["name"],
        "title": format_title(repo["name"]),
        "description": repo.get("description") or "",
        "url": resolve_url(repo, user),
        "repo": repo.get("repo") or "",
        "image": repo.get("image"),
        "language": repo.get("language"),
        "license": repo.get("license"),
        "categories": categories,
        "topics": filtered_topics,
        "pushed_at": repo.get("pushed_at"),
    }


def build_projects_payload(
    raw_repos: list[dict],
    user: str = "giosci1994",
    topic: str = "showcase",
    include_repos: set[str] | None = None,
) -> dict:
    """Filter, transform, and deterministically sort projects (newest pushed_at first)."""
    normalized = [normalize_repo(repo) for repo in raw_repos]
    projects = [
        extract_project(repo, user=user, topic=topic)
        for repo in normalized
        if is_eligible_repo(repo, topic=topic, include_repos=include_repos)
    ]
    projects.sort(key=lambda item: (item["name"].lower(), item["name"]))
    projects.sort(key=lambda item: item.get("pushed_at") or "", reverse=True)
    return {
        "user": user,
        "topic": topic,
        "projects": projects,
    }


def fetch_repos_graphql(user: str, token: str) -> list[dict]:
    """Fetch public owner repositories via GitHub GraphQL API with cursor pagination."""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "giosci1994-projects-indexer",
    }
    repos: list[dict] = []
    cursor: str | None = None

    while True:
        body = json.dumps(
            {
                "query": GRAPHQL_QUERY,
                "variables": {"user": user, "cursor": cursor},
            }
        ).encode("utf-8")
        request = urllib.request.Request(GRAPHQL_URL, data=body, headers=headers, method="POST")
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))

        if not isinstance(payload, dict):
            raise ValueError("Unexpected GitHub GraphQL response format")
        if payload.get("errors"):
            raise ValueError(f"GitHub GraphQL errors: {payload['errors']}")

        user_data = (payload.get("data") or {}).get("user")
        if not isinstance(user_data, dict):
            raise ValueError(f"GitHub user not found in GraphQL response: {user}")

        repo_conn = user_data.get("repositories") or {}
        nodes = repo_conn.get("nodes") or []
        if not isinstance(nodes, list):
            raise ValueError("Unexpected GraphQL repositories nodes format")
        repos.extend(node for node in nodes if isinstance(node, dict))

        page_info = repo_conn.get("pageInfo") or {}
        if not page_info.get("hasNextPage"):
            break
        cursor = page_info.get("endCursor")
        if not cursor:
            break

    return repos


def fetch_repos_rest(user: str, token: str | None = None) -> list[dict]:
    """Fallback: fetch public owner repositories via GitHub REST API with Link pagination."""
    encoded_user = urllib.parse.quote(user, safe="")
    url: str | None = f"{API_BASE}/users/{encoded_user}/repos?type=owner&per_page=100&sort=pushed"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "giosci1994-projects-indexer",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    repos: list[dict] = []
    while url:
        request = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
            if not isinstance(data, list):
                raise ValueError("Unexpected GitHub REST API response format")
            repos.extend(item for item in data if isinstance(item, dict))
            url = parse_next_link(response.headers.get("Link"))

    return repos


def fetch_repos(user: str, token: str | None = None) -> list[dict]:
    """Use GraphQL when a token is available (for custom OG images), else fallback to REST."""
    if token:
        return fetch_repos_graphql(user, token)
    return fetch_repos_rest(user, token=None)


def parse_include_repos(raw: str) -> set[str]:
    """Parse comma-separated repository names into a clean set."""
    return {item.strip() for item in raw.split(",") if item.strip()}


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Update assets/projects.json from public GitHub repositories."
    )
    parser.add_argument(
        "--user",
        default="giosci1994",
        help="GitHub username (default: giosci1994)",
    )
    parser.add_argument(
        "--topic",
        default="showcase",
        help="Required repository topic (default: showcase)",
    )
    parser.add_argument(
        "--output",
        default="assets/projects.json",
        help="Output JSON path (default: assets/projects.json)",
    )
    parser.add_argument(
        "--include-repos",
        default="",
        help="Optional comma-separated public repo names to include even without --topic",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print generated JSON to stdout without writing the output file",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Run CLI entrypoint."""
    args = parse_args(argv)
    token = os.environ.get("GITHUB_TOKEN", "").strip() or None
    include_repos = parse_include_repos(args.include_repos)

    try:
        raw_repos = fetch_repos(args.user, token=token)
    except (urllib.error.HTTPError, urllib.error.URLError, ValueError, json.JSONDecodeError) as exc:
        print(f"Error fetching repositories for {args.user}: {exc}", file=sys.stderr)
        return 1

    payload = build_projects_payload(
        raw_repos,
        user=args.user,
        topic=args.topic,
        include_repos=include_repos or None,
    )
    rendered = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"

    if args.dry_run:
        sys.stdout.write(rendered)
        return 0

    parent = os.path.dirname(args.output)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as handle:
        handle.write(rendered)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
