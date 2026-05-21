"""Collect productivity metrics for the Squad 07 dashboard.

The script is intentionally idempotent: every execution reads repository data
from GitHub and rewrites ``metrics.json`` from scratch.
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Any

try:
    from github import Github
    from github.GithubException import GithubException
except ImportError as exc:  # pragma: no cover - defensive runtime guard
    raise SystemExit(
        "PyGithub is required. Install it with: python -m pip install PyGithub"
    ) from exc


OUTPUT_PATH = Path(__file__).with_name("metrics.json")
COMMIT_MESSAGE_BUCKETS = [
    ("0-20", 0, 20),
    ("21-50", 21, 50),
    ("51-100", 51, 100),
    ("101-200", 101, 200),
    ("200+", 201, None),
]
COAUTHOR_RE = re.compile(r"^Co-authored-by:\s*(?P<name>.+?)\s*<[^>]+>\s*$", re.I)


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise SystemExit(f"Missing required environment variable: {name}")
    return value


def iso_week(value: datetime | date) -> str:
    year, week, _ = value.isocalendar()
    return f"{year}-W{week:02d}"


def week_start(value: datetime | date) -> date:
    if isinstance(value, datetime):
        value = value.date()
    return value - timedelta(days=value.weekday())


def week_range(values: list[datetime | date]) -> list[str]:
    if not values:
        return []

    start = week_start(min(values))
    end = week_start(max(values))
    weeks: list[str] = []

    current = start
    while current <= end:
        weeks.append(iso_week(current))
        current += timedelta(days=7)

    return weeks


def user_key(user: Any) -> tuple[str, str]:
    if user is None:
        return ("ghost", "ghost")

    username = getattr(user, "login", None) or "ghost"
    name = getattr(user, "name", None) or username
    return (username, name)


def increment_user(counter: dict[tuple[str, str], int], user: Any) -> None:
    counter[user_key(user)] += 1


def ranked_users(counter: dict[tuple[str, str], int], value_key: str) -> list[dict[str, Any]]:
    rows = [
        {"username": username, "name": name, value_key: count}
        for (username, name), count in counter.items()
    ]
    return sorted(rows, key=lambda row: (-row[value_key], row["username"]))


def histogram_bucket(message: str) -> str:
    length = len(message or "")
    for label, start, end in COMMIT_MESSAGE_BUCKETS:
        if end is None and length >= start:
            return label
        if end is not None and start <= length <= end:
            return label
    return "200+"


def empty_commit_heatmap() -> dict[tuple[int, int], int]:
    return {(day, hour): 0 for day in range(7) for hour in range(24)}


def parse_coauthors(message: str) -> list[str]:
    coauthors: list[str] = []
    for line in (message or "").splitlines():
        match = COAUTHOR_RE.match(line.strip())
        if match:
            coauthors.append(match.group("name").strip())
    return coauthors


def collect_issue_metrics(repo: Any) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    opened_by_week: Counter[str] = Counter()
    closed_by_week: Counter[str] = Counter()
    opened_by_user: defaultdict[tuple[str, str], int] = defaultdict(int)
    closed_by_user: defaultdict[tuple[str, str], int] = defaultdict(int)
    dates: list[datetime] = []

    for issue in repo.get_issues(state="all"):
        if getattr(issue, "pull_request", None):
            continue

        if issue.created_at:
            opened_by_week[iso_week(issue.created_at)] += 1
            dates.append(issue.created_at)
        increment_user(opened_by_user, issue.user)

        if issue.closed_at:
            closed_by_week[iso_week(issue.closed_at)] += 1
            dates.append(issue.closed_at)
            increment_user(closed_by_user, getattr(issue, "closed_by", None))

    weeks = week_range(dates)
    issues_per_week = [
        {
            "week": week,
            "opened": opened_by_week[week],
            "closed": closed_by_week[week],
        }
        for week in weeks
    ]

    issue_users = set(opened_by_user) | set(closed_by_user)
    top_issue_contributors = [
        {
            "username": username,
            "name": name,
            "opened": opened_by_user[(username, name)],
            "closed": closed_by_user[(username, name)],
            "total": opened_by_user[(username, name)] + closed_by_user[(username, name)],
        }
        for username, name in issue_users
    ]
    top_issue_contributors.sort(key=lambda row: (-row["total"], row["username"]))

    return issues_per_week, top_issue_contributors


def collect_commit_metrics(
    repo: Any,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    histogram = Counter({label: 0 for label, _, _ in COMMIT_MESSAGE_BUCKETS})
    coauthors_by_week: Counter[str] = Counter()
    committers: defaultdict[tuple[str, str], int] = defaultdict(int)
    heatmap = empty_commit_heatmap()
    commit_dates: list[datetime] = []

    for commit in repo.get_commits():
        commit_data = commit.commit
        message = commit_data.message or ""
        author_date = commit_data.author.date

        if author_date is not None:
            if author_date.tzinfo is None:
                author_date = author_date.replace(tzinfo=UTC)
            commit_dates.append(author_date)
            heatmap[(author_date.weekday(), author_date.hour)] += 1

        histogram[histogram_bucket(message)] += 1
        increment_user(committers, commit.author)

        if author_date is not None:
            coauthors_by_week[iso_week(author_date)] += len(parse_coauthors(message))

    weeks = week_range(commit_dates)
    commit_message_histogram = [
        {"range": label, "count": histogram[label]}
        for label, _, _ in COMMIT_MESSAGE_BUCKETS
    ]
    coauthors_per_week = [
        {"week": week, "count": coauthors_by_week[week]}
        for week in weeks
    ]
    commit_heatmap = [
        {"day": day, "hour": hour, "count": heatmap[(day, hour)]}
        for day in range(7)
        for hour in range(24)
    ]

    return (
        commit_message_histogram,
        coauthors_per_week,
        commit_heatmap,
        ranked_users(committers, "commits"),
    )


def collect_pr_metrics(repo: Any) -> list[dict[str, Any]]:
    pr_authors: defaultdict[tuple[str, str], int] = defaultdict(int)

    for pull_request in repo.get_pulls(state="all"):
        increment_user(pr_authors, pull_request.user)

    return ranked_users(pr_authors, "prs_opened")


def write_metrics(metrics: dict[str, Any]) -> None:
    OUTPUT_PATH.write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    token = require_env("GITHUB_TOKEN")
    repository_name = require_env("GITHUB_REPOSITORY")

    try:
        repo = Github(token).get_repo(repository_name)
        issues_per_week, top_issue_contributors = collect_issue_metrics(repo)
        (
            commit_message_histogram,
            coauthors_per_week,
            commit_heatmap,
            top_committers,
        ) = collect_commit_metrics(repo)
        top_pr_authors = collect_pr_metrics(repo)
    except GithubException as exc:
        print(f"GitHub API error: {exc}", file=sys.stderr)
        return 1

    metrics = {
        "generated_at": datetime.now(UTC).replace(microsecond=0).isoformat(),
        "repository": repository_name,
        "issues_per_week": issues_per_week,
        "commit_message_histogram": commit_message_histogram,
        "coauthors_per_week": coauthors_per_week,
        "commit_heatmap": commit_heatmap,
        "top_committers": top_committers,
        "top_pr_authors": top_pr_authors,
        "top_issue_contributors": top_issue_contributors,
    }
    write_metrics(metrics)
    print(f"Wrote metrics to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
