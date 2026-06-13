#!/usr/bin/env python3
"""Push modified source files to main branch via GitHub API.
Only pushes the source files that changed, not build artifacts."""

import subprocess, json, os, sys, base64, time

REPO = "ezsatoriyama-pixel/zero22-football"
GH = r"C:\Program Files\GitHub CLI\gh.exe"
BASE = r"C:\Users\83668\.qwenpaw\workspaces\default\football-predict"

# Files to push (relative to project root)
FILES = [
    "lib/mockData.ts",
    "app/login/page.tsx",
    "app/matches/[id]/page.tsx",
    "components/Header.tsx",
    "components/ProModal.tsx",
    "components/Footer.tsx",
    "components/ScoreProbability.tsx",
    "components/StrengthBar.tsx",
    "app/page.tsx",
    "app/matches/page.tsx",
    "app/history/page.tsx",
    "app/layout.tsx",
    "app/globals.css",
    "tailwind.config.ts",
    "next.config.js",
    ".github/workflows/deploy.yml",
]

def gh_post(endpoint, body, retries=8):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint, "--input", "-"]
        r = subprocess.run(cmd, input=json.dumps(body), capture_output=True, text=True, timeout=180)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        err = r.stderr.strip()[-150:]
        if attempt < retries - 1:
            wait = min(10*(attempt+1), 60)
            print(f"  [{endpoint}] retry {attempt+1}/{retries} in {wait}s: {err}")
            time.sleep(wait)
    print(f"FATAL: {err}", file=sys.stderr)
    sys.exit(1)

def gh_get(endpoint, retries=5):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        time.sleep(min(5*(attempt+1), 30))
    sys.exit(1)

def gh_patch(endpoint, body, retries=5):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint, "-X", "PATCH", "--input", "-"]
        r = subprocess.run(cmd, input=json.dumps(body), capture_output=True, text=True, timeout=180)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        time.sleep(min(5*(attempt+1), 30))
    sys.exit(1)

def main():
    # Read all files
    file_map = {}
    for f in FILES:
        path = os.path.join(BASE, f)
        if not os.path.exists(path):
            print(f"SKIP (not found): {f}")
            continue
        with open(path, "rb") as fh:
            file_map[f] = fh.read()
        print(f"  Read: {f} ({len(file_map[f])} bytes)")
    
    print(f"\nTotal: {len(file_map)} files to push")
    
    # Get current main
    print("\n=== Getting main ===")
    ref = gh_get(f"repos/{REPO}/git/refs/heads/main")
    parent = ref["object"]["sha"]
    tree = gh_get(f"repos/{REPO}/git/commits/{parent}")["tree"]["sha"]
    print(f"  Parent: {parent}")

    # Create blobs
    print(f"\n=== Creating blobs ===")
    tree_items = []
    for path, content in file_map.items():
        b64 = base64.b64encode(content).decode()
        blob = gh_post(f"repos/{REPO}/git/blobs", {"content": b64, "encoding": "base64"})
        tree_items.append({"path": path, "mode": "100644", "type": "blob", "sha": blob["sha"]})
        print(f"  {path} -> {blob['sha'][:12]}")

    # Create tree
    print("\n=== Creating tree ===")
    new_tree = gh_post(f"repos/{REPO}/git/trees", {"base_tree": tree, "tree": tree_items})
    print(f"  Tree: {new_tree['sha']}")

    # Create commit
    print("\n=== Creating commit ===")
    commit = gh_post(f"repos/{REPO}/git/commits", {
        "message": "v6: Sync all source files (new match data, Apple style, no breakpoints)",
        "tree": new_tree["sha"],
        "parents": [parent]
    })
    print(f"  Commit: {commit['sha']}")

    # Update ref
    print("\n=== Updating main ===")
    gh_patch(f"repos/{REPO}/git/refs/heads/main", {"sha": commit["sha"], "force": True})
    print("  Done!")
    
    print(f"\n✅ All {len(file_map)} source files synced to main.")
    print("   Actions will auto-deploy: https://github.com/ezsatoriyama-pixel/zero22-football/actions")

if __name__ == "__main__":
    main()
