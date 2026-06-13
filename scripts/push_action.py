#!/usr/bin/env python3
"""Push a single file (the workflow) to main branch, then trigger the deploy."""

import subprocess, json, os, sys, base64, time

REPO = "ezsatoriyama-pixel/zero22-football"
WF_PATH = r"C:\Users\83668\.qwenpaw\workspaces\default\football-predict\.github\workflows\deploy.yml"
GH = r"C:\Program Files\GitHub CLI\gh.exe"

def gh_post(endpoint, body, retries=8):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint, "--input", "-"]
        r = subprocess.run(cmd, input=json.dumps(body), capture_output=True, text=True, timeout=180)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        err = r.stderr.strip()[-200:]
        if attempt < retries - 1:
            wait = min(10 * (attempt+1), 60)
            print(f"  retry {attempt+1}/{retries} in {wait}s: {err}")
            time.sleep(wait)
    print(f"FATAL: {err}", file=sys.stderr)
    sys.exit(1)

def gh_get(endpoint, retries=5):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        if attempt < retries - 1:
            time.sleep(min(5*(attempt+1), 30))
    print("FATAL: GET failed", file=sys.stderr)
    sys.exit(1)

def gh_patch(endpoint, body, retries=5):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint, "-X", "PATCH", "--input", "-"]
        r = subprocess.run(cmd, input=json.dumps(body), capture_output=True, text=True, timeout=180)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        if attempt < retries - 1:
            time.sleep(min(5*(attempt+1), 30))
    print("FATAL: PATCH failed", file=sys.stderr)
    sys.exit(1)

def main():
    # Read workflow file
    with open(WF_PATH, "rb") as f:
        content = f.read()
    
    print("=== Getting main branch ref ===")
    ref = gh_get(f"repos/{REPO}/git/refs/heads/main")
    parent = ref["object"]["sha"]
    tree = gh_get(f"repos/{REPO}/git/commits/{parent}")["tree"]["sha"]
    print(f"  Parent: {parent}")

    # Check if .github/workflows exists in tree
    print("\n=== Creating blob ===")
    b64 = base64.b64encode(content).decode()
    blob_sha = gh_post(f"repos/{REPO}/git/blobs", {"content": b64, "encoding": "base64"})
    print(f"  Blob: {blob_sha['sha']}")

    # Create a nested tree for .github/workflows/deploy.yml
    print("\n=== Creating tree ===")
    # First create workflows tree
    wf_tree = gh_post(f"repos/{REPO}/git/trees", {
        "base_tree": tree,
        "tree": [
            {"path": ".github/workflows/deploy.yml", "mode": "100644", "type": "blob", "sha": blob_sha["sha"]}
        ]
    })
    print(f"  Tree: {wf_tree['sha']}")

    # Create commit
    print("\n=== Creating commit ===")
    commit = gh_post(f"repos/{REPO}/git/commits", {
        "message": "Add deploy workflow", "tree": wf_tree["sha"], "parents": [parent]
    })
    print(f"  Commit: {commit['sha']}")

    # Update ref
    print("\n=== Updating main ===")
    gh_patch(f"repos/{REPO}/git/refs/heads/main", {"sha": commit["sha"], "force": True})
    print("  Done!")

    # Trigger workflow
    print("\n=== Triggering workflow ===")
    result = gh_post(f"repos/{REPO}/actions/workflows/deploy.yml/dispatches", {
        "ref": "main"
    })
    print("  Workflow triggered!")
    print("\n✅ Check progress at: https://github.com/ezsatoriyama-pixel/zero22-football/actions")

if __name__ == "__main__":
    main()
