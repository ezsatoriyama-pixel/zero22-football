#!/usr/bin/env python3
"""Push next.config.js fix to main branch."""

import subprocess, json, os, sys, base64, time

REPO = "ezsatoriyama-pixel/zero22-football"
GH = r"C:\Program Files\GitHub CLI\gh.exe"

# The correct next.config.js content
CONFIG_CONTENT = """\
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/zero22-football',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
"""

def gh_post(endpoint, body, retries=8):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint, "--input", "-"]
        r = subprocess.run(cmd, input=json.dumps(body), capture_output=True, text=True, timeout=180)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        if attempt < retries - 1:
            wait = min(10*(attempt+1), 60)
            print(f"  retry {attempt+1}/{retries}: {r.stderr.strip()[-100:]}")
            time.sleep(wait)
    print(f"FATAL", file=sys.stderr)
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
    print("=== Getting main ===")
    ref = gh_get(f"repos/{REPO}/git/refs/heads/main")
    parent = ref["object"]["sha"]
    tree = gh_get(f"repos/{REPO}/git/commits/{parent}")["tree"]["sha"]
    print(f"  Parent: {parent}")

    # Create blob for new next.config.js
    print("\n=== Creating blob ===")
    b64 = base64.b64encode(CONFIG_CONTENT.encode()).decode()
    blob_sha = gh_post(f"repos/{REPO}/git/blobs", {"content": b64, "encoding": "base64"})
    print(f"  Blob: {blob_sha['sha']}")

    # Create tree (only update next.config.js)
    print("\n=== Creating tree ===")
    new_tree = gh_post(f"repos/{REPO}/git/trees", {
        "base_tree": tree,
        "tree": [
            {"path": "next.config.js", "mode": "100644", "type": "blob", "sha": blob_sha["sha"]}
        ]
    })
    print(f"  Tree: {new_tree['sha']}")

    # Create commit
    print("\n=== Creating commit ===")
    commit = gh_post(f"repos/{REPO}/git/commits", {
        "message": "fix: add basePath to next.config.js for GitHub Pages",
        "tree": new_tree["sha"],
        "parents": [parent]
    })
    print(f"  Commit: {commit['sha']}")

    # Update ref
    print("\n=== Updating main ===")
    gh_patch(f"repos/{REPO}/git/refs/heads/main", {"sha": commit["sha"], "force": True})
    print("  Done!")

    # Trigger workflow again
    print("\n=== Triggering rebuild ===")
    gh_post(f"repos/{REPO}/actions/workflows/deploy.yml/dispatches", {"ref": "main"})
    print("  New build triggered!")

if __name__ == "__main__":
    main()
