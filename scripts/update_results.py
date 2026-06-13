import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANUAL_RESULTS = ROOT / "data" / "daily-results.json"
PUBLIC_RESULTS = ROOT / "public" / "data" / "results.json"


def normalize_score(value):
    if value is None:
        return None
    match = re.match(r"^\s*(\d+)\s*[:：-]\s*(\d+)\s*$", str(value))
    if not match:
        return None
    home, away = int(match.group(1)), int(match.group(2))
    if home < 0 or away < 0 or home > 20 or away > 20:
        return None
    return f"{home}:{away}"


def load_json(path):
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {path}: {exc}") from exc


def read_results_from_payload(payload):
    raw = payload.get("results", payload) if isinstance(payload, dict) else payload
    results = {}

    if isinstance(raw, list):
        items = raw
    elif isinstance(raw, dict):
        items = [dict(value, matchId=key) if isinstance(value, dict) else {"matchId": key, "actualScore": value} for key, value in raw.items()]
    else:
        return results

    for item in items:
        if not isinstance(item, dict):
            continue
        match_id = item.get("matchId") or item.get("id")
        score = normalize_score(item.get("actualScore") or item.get("score"))
        if not match_id or not score:
            continue
        results[str(match_id)] = {
            "matchId": str(match_id),
            "actualScore": score,
            "updatedAt": item.get("updatedAt") or datetime.now(timezone.utc).isoformat(),
        }

    return results


def fetch_feed_results():
    feed_url = os.environ.get("RESULTS_FEED_URL")
    if not feed_url:
        return {}

    token = os.environ.get("RESULTS_FEED_TOKEN")
    request = urllib.request.Request(feed_url, headers={"Accept": "application/json"})
    if token:
        request.add_header("Authorization", f"Bearer {token}")

    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return read_results_from_payload(payload)


def main():
    manual = read_results_from_payload(load_json(MANUAL_RESULTS))
    remote = fetch_feed_results()
    merged = {**manual, **remote}

    PUBLIC_RESULTS.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_RESULTS.write_text(
        json.dumps({"results": merged}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {PUBLIC_RESULTS.relative_to(ROOT)} with {len(merged)} result(s).")

    if os.environ.get("GITHUB_OUTPUT"):
      Path(os.environ["GITHUB_OUTPUT"]).write_text(f"count={len(merged)}\n", encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Failed to update results: {exc}", file=sys.stderr)
        raise
