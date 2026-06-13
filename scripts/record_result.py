import argparse
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANUAL_RESULTS = ROOT / "data" / "daily-results.json"


def normalize_score(value):
    match = re.match(r"^\s*(\d+)\s*[:：-]\s*(\d+)\s*$", value)
    if not match:
        raise SystemExit("Score must look like 2:1")
    home, away = int(match.group(1)), int(match.group(2))
    if home < 0 or away < 0 or home > 20 or away > 20:
        raise SystemExit("Each team score must be between 0 and 20")
    return f"{home}:{away}"


def load_results():
    if not MANUAL_RESULTS.exists():
        return {"results": {}}
    return json.loads(MANUAL_RESULTS.read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser(description="Persist a match result into repository data files.")
    parser.add_argument("--match-id", required=True)
    parser.add_argument("--score", required=True, help="Actual score, for example 2:1")
    args = parser.parse_args()

    payload = load_results()
    results = payload.setdefault("results", {})
    score = normalize_score(args.score)
    results[args.match_id] = {
        "matchId": args.match_id,
        "actualScore": score,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }

    MANUAL_RESULTS.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    subprocess.run([sys.executable, str(ROOT / "scripts" / "update_results.py")], check=True)
    print(f"Recorded {args.match_id} = {score}")


if __name__ == "__main__":
    main()
