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
    from github import Auth, Github
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


def person_metrics_row(username: str, name: str) -> dict[str, Any]:
    return {
        "username": username,
        "name": name,
        "issues_opened": 0,
        "issues_assigned": 0,
        "issues_closed": 0,
        "issues_pending": 0,
        "prs_opened": 0,
        "prs_reviewed": 0,
        "prs_merged": 0,
        "commits": 0,
    }


def ensure_person(
    people: dict[tuple[str, str], dict[str, Any]],
    user: Any,
) -> dict[str, Any]:
    username, name = user_key(user)
    return ensure_person_key(people, username, name)


def ensure_person_key(
    people: dict[tuple[str, str], dict[str, Any]],
    username: str,
    name: str,
) -> dict[str, Any]:
    key = (username, name)
    if key not in people:
        people[key] = person_metrics_row(username, name)
    return people[key]


def labels_from_issue(issue: Any) -> list[str]:
    return [label.name for label in getattr(issue, "labels", [])]


def is_documentation_item(labels: list[str], title: str = "") -> bool:
    normalized_labels = {label.lower() for label in labels}
    normalized_title = (title or "").lower()
    return (
        "documentation" in normalized_labels
        or "docs" in normalized_labels
        or normalized_title.startswith("docs:")
    )


def sorted_counter_rows(counter: Counter[Any], key_name: str) -> list[dict[str, Any]]:
    return [
        {key_name: key, "count": count}
        for key, count in sorted(counter.items(), key=lambda item: (-item[1], str(item[0])))
    ]


def merge_metric_rows(
    target: dict[tuple[str, str], dict[str, Any]],
    source: dict[tuple[str, str], dict[str, Any]],
) -> None:
    for key, row in source.items():
        if key not in target:
            target[key] = {
                field: 0 if isinstance(value, int) else value
                for field, value in row.items()
            }
        for field, value in row.items():
            if isinstance(value, int):
                target[key][field] = target[key].get(field, 0) + value
            else:
                target[key][field] = value


def sorted_people_metrics(
    people: dict[tuple[str, str], dict[str, Any]],
) -> list[dict[str, Any]]:
    return sorted(
        people.values(),
        key=lambda row: (
            -sum(value for key, value in row.items() if key not in {"username", "name"} and isinstance(value, int)),
            row["username"],
        ),
    )


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


def collect_issue_metrics(
    repo: Any,
) -> tuple[
    list[dict[str, Any]],
    list[dict[str, Any]],
    dict[tuple[str, str], dict[str, Any]],
    list[dict[str, Any]],
    list[dict[str, Any]],
    list[dict[str, Any]],
    list[dict[str, Any]],
    dict[tuple[str, str], dict[str, Any]],
]:
    opened_by_week: Counter[str] = Counter()
    closed_by_week: Counter[str] = Counter()
    opened_by_user: defaultdict[tuple[str, str], int] = defaultdict(int)
    closed_by_user: defaultdict[tuple[str, str], int] = defaultdict(int)
    people: dict[tuple[str, str], dict[str, Any]] = {}
    labels_distribution: Counter[str] = Counter()
    labels_by_person: Counter[tuple[str, str, str]] = Counter()
    documentation: dict[tuple[str, str], dict[str, Any]] = {}
    milestone_progress: dict[str, dict[str, Any]] = {}
    milestone_progress_by_person: dict[tuple[str, str, str], dict[str, Any]] = {}
    dates: list[datetime] = []

    for issue in repo.get_issues(state="all"):
        if getattr(issue, "pull_request", None):
            continue

        labels = labels_from_issue(issue)
        is_closed = bool(issue.closed_at)
        is_open = not is_closed
        is_documentation = is_documentation_item(labels, issue.title)
        milestone_name = issue.milestone.title if issue.milestone else "Sem milestone"
        issue_author = ensure_person(people, issue.user)

        if issue.created_at:
            opened_by_week[iso_week(issue.created_at)] += 1
            dates.append(issue.created_at)
        increment_user(opened_by_user, issue.user)
        issue_author["issues_opened"] += 1

        if issue.closed_at:
            closed_by_week[iso_week(issue.closed_at)] += 1
            dates.append(issue.closed_at)
            increment_user(closed_by_user, getattr(issue, "closed_by", None))

        for label in labels:
            labels_distribution[label] += 1

        if milestone_name not in milestone_progress:
            milestone_progress[milestone_name] = {
                "milestone": milestone_name,
                "opened": 0,
                "closed": 0,
                "pending": 0,
            }
        milestone_progress[milestone_name]["opened"] += 1
        milestone_progress[milestone_name]["closed"] += int(is_closed)
        milestone_progress[milestone_name]["pending"] += int(is_open)

        for assignee in issue.assignees:
            person = ensure_person(people, assignee)
            person["issues_assigned"] += 1
            person["issues_closed"] += int(is_closed)
            person["issues_pending"] += int(is_open)

            username, name = user_key(assignee)
            for label in labels:
                labels_by_person[(username, name, label)] += 1

            milestone_key = (milestone_name, username, name)
            if milestone_key not in milestone_progress_by_person:
                milestone_progress_by_person[milestone_key] = {
                    "milestone": milestone_name,
                    "username": username,
                    "name": name,
                    "assigned": 0,
                    "closed": 0,
                    "pending": 0,
                }
            milestone_progress_by_person[milestone_key]["assigned"] += 1
            milestone_progress_by_person[milestone_key]["closed"] += int(is_closed)
            milestone_progress_by_person[milestone_key]["pending"] += int(is_open)

            if is_documentation:
                doc_row = documentation.setdefault(
                    (username, name),
                    {
                        "username": username,
                        "name": name,
                        "issues": 0,
                        "pull_requests": 0,
                        "commits": 0,
                        "total": 0,
                    },
                )
                doc_row["issues"] += 1
                doc_row["total"] += 1

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

    label_people_rows = [
        {
            "username": username,
            "name": name,
            "label": label,
            "count": count,
        }
        for (username, name, label), count in labels_by_person.items()
    ]
    label_people_rows.sort(key=lambda row: (-row["count"], row["username"], row["label"]))

    return (
        issues_per_week,
        top_issue_contributors,
        people,
        sorted_counter_rows(labels_distribution, "label"),
        label_people_rows,
        sorted(
            milestone_progress.values(),
            key=lambda row: (-row["closed"], row["milestone"]),
        ),
        sorted(
            milestone_progress_by_person.values(),
            key=lambda row: (row["milestone"], -row["closed"], row["username"]),
        ),
        documentation,
    )


def collect_commit_metrics(
    repo: Any,
) -> tuple[
    list[dict[str, Any]],
    list[dict[str, Any]],
    list[dict[str, Any]],
    list[dict[str, Any]],
    dict[tuple[str, str], dict[str, Any]],
    dict[tuple[str, str], dict[str, Any]],
]:
    histogram = Counter({label: 0 for label, _, _ in COMMIT_MESSAGE_BUCKETS})
    coauthors_by_week: Counter[str] = Counter()
    committers: defaultdict[tuple[str, str], int] = defaultdict(int)
    people: dict[tuple[str, str], dict[str, Any]] = {}
    documentation: dict[tuple[str, str], dict[str, Any]] = {}
    heatmap = empty_commit_heatmap()
    commit_dates: list[datetime] = []

    for commit in repo.get_commits():
        commit_data = commit.commit
        message = commit_data.message or ""
        author_date = commit_data.author.date
        author = ensure_person(people, commit.author)

        if author_date is not None:
            if author_date.tzinfo is None:
                author_date = author_date.replace(tzinfo=UTC)
            commit_dates.append(author_date)
            heatmap[(author_date.weekday(), author_date.hour)] += 1

        histogram[histogram_bucket(message)] += 1
        increment_user(committers, commit.author)
        author["commits"] += 1

        try:
            changed_files = getattr(commit, "files", []) or []
        except GithubException:
            changed_files = []

        if any(
            file.filename.startswith("docs/") or file.filename.endswith(".md")
            for file in changed_files
        ):
            username, name = user_key(commit.author)
            doc_row = documentation.setdefault(
                (username, name),
                {
                    "username": username,
                    "name": name,
                    "issues": 0,
                    "pull_requests": 0,
                    "commits": 0,
                    "total": 0,
                },
            )
            doc_row["commits"] += 1
            doc_row["total"] += 1

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
        people,
        documentation,
    )


def collect_pr_metrics(
    repo: Any,
) -> tuple[
    list[dict[str, Any]],
    dict[tuple[str, str], dict[str, Any]],
    dict[tuple[str, str], dict[str, Any]],
]:
    pr_authors: defaultdict[tuple[str, str], int] = defaultdict(int)
    people: dict[tuple[str, str], dict[str, Any]] = {}
    documentation: dict[tuple[str, str], dict[str, Any]] = {}

    for pull_request in repo.get_pulls(state="all"):
        author = ensure_person(people, pull_request.user)
        author["prs_opened"] += 1
        increment_user(pr_authors, pull_request.user)

        if pull_request.merged_at:
            author["prs_merged"] += 1

        labels = labels_from_issue(pull_request)
        if is_documentation_item(labels, pull_request.title):
            username, name = user_key(pull_request.user)
            doc_row = documentation.setdefault(
                (username, name),
                {
                    "username": username,
                    "name": name,
                    "issues": 0,
                    "pull_requests": 0,
                    "commits": 0,
                    "total": 0,
                },
            )
            doc_row["pull_requests"] += 1
            doc_row["total"] += 1

        try:
            reviewers = {user_key(review.user) for review in pull_request.get_reviews()}
        except GithubException:
            reviewers = set()

        for username, name in reviewers:
            reviewer = ensure_person_key(people, username, name)
            reviewer["prs_reviewed"] += 1

    return ranked_users(pr_authors, "prs_opened"), people, documentation


def write_metrics(metrics: dict[str, Any]) -> None:
    OUTPUT_PATH.write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    token = require_env("GITHUB_TOKEN")
    repository_name = require_env("GITHUB_REPOSITORY")

    try:
        repo = Github(auth=Auth.Token(token)).get_repo(repository_name)
        (
            issues_per_week,
            top_issue_contributors,
            issue_people,
            labels_distribution,
            labels_by_person,
            milestone_progress,
            milestone_progress_by_person,
            issue_documentation,
        ) = collect_issue_metrics(repo)
        (
            commit_message_histogram,
            coauthors_per_week,
            commit_heatmap,
            top_committers,
            commit_people,
            commit_documentation,
        ) = collect_commit_metrics(repo)
        top_pr_authors, pr_people, pr_documentation = collect_pr_metrics(repo)
    except GithubException as exc:
        print(f"GitHub API error: {exc}", file=sys.stderr)
        return 1

    people_metrics: dict[tuple[str, str], dict[str, Any]] = {}
    documentation_contributions: dict[tuple[str, str], dict[str, Any]] = {}
    for source in (issue_people, commit_people, pr_people):
        merge_metric_rows(people_metrics, source)
    for source in (issue_documentation, commit_documentation, pr_documentation):
        merge_metric_rows(documentation_contributions, source)

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
        "people_metrics": sorted_people_metrics(people_metrics),
        "labels_distribution": labels_distribution,
        "labels_by_person": labels_by_person,
        "documentation_contributions": sorted_people_metrics(documentation_contributions),
        "milestone_progress": milestone_progress,
        "milestone_progress_by_person": milestone_progress_by_person,
    }
    write_metrics(metrics)
    print(f"Wrote metrics to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
