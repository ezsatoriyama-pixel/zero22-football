#!/usr/bin/env python3
"""Deploy out/ to GitHub Pages via GitHub REST API with retries."""

import subprocess, json, os, sys, base64, time

REPO = "ezsatoriyama-pixel/zero22-football"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "out")
GH = r"C:\Program Files\GitHub CLI\gh.exe"

def gh_post(endpoint, body, retries=5):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint, "--input", "-"]
        r = subprocess.run(cmd, input=json.dumps(body), capture_output=True, text=True, timeout=180)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        err = r.stderr.strip()[-200:]
        print(f"  [{endpoint}] attempt {attempt+1}/{retries} FAILED: {err}")
        if attempt < retries - 1:
            time.sleep(min(5 * (attempt+1), 30))
    print(f"FATAL: {endpoint} after {retries} retries", file=sys.stderr)
    sys.exit(1)

def gh_patch(endpoint, body, retries=5):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint, "-X", "PATCH", "--input", "-"]
        r = subprocess.run(cmd, input=json.dumps(body), capture_output=True, text=True, timeout=180)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        err = r.stderr.strip()[-200:]
        print(f"  [{endpoint}] attempt {attempt+1}/{retries} FAILED: {err}")
        if attempt < retries - 1:
            time.sleep(min(5 * (attempt+1), 30))
    print(f"FATAL: {endpoint} after {retries} retries", file=sys.stderr)
    sys.exit(1)

def gh_get(endpoint, retries=5):
    for attempt in range(retries):
        cmd = [GH, "api", endpoint]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode == 0:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        err = r.stderr.strip()[-200:]
        print(f"  [{endpoint}] attempt {attempt+1}/{retries} FAILED: {err}")
        if attempt < retries - 1:
            time.sleep(min(5 * (attempt+1), 30))
    print(f"FATAL: {endpoint} after {retries} retries", file=sys.stderr)
    sys.exit(1)

def main():
    print("=== Reading files ===")
    files = {}
    for root, _, filenames in os.walk(OUT_DIR):
        for fn in filenames:
            fpath = os.path.join(root, fn)
            rel = os.path.relpath(fpath, OUT_DIR).replace("\\", "/")
            with open(fpath, "rb") as f:
                files[rel] = f.read()
    print(f"Total: {len(files)} files")

    print("\n=== Getting base commit ===")
    ref = gh_get(f"repos/{REPO}/git/refs/heads/gh-pages")
    parent = ref["object"]["sha"]
    tree = gh_get(f"repos/{REPO}/git/commits/{parent}")["tree"]["sha"]
    print(f"  Parent: {parent}, Tree: {tree}")

    print(f"\n=== Creating blobs ===")
    items, batch = {}, []
    for i, (path, content) in enumerate(files.items()):
        b64 = base64.b64encode(content).decode()
        sha = gh_post(f"repos/{REPO}/git/blobs", {"content": b64, "encoding": "base64"})
        items[path] = sha
        if (i+1) % 50 == 0 or i == len(files)-1:
            print(f"  {i+1}/{len(files)} done, last: {path}")

    print("\n=== Creating tree ===")
    tree_items = [{"path": p, "mode": "100644", "type": "blob", "sha": s} for p,s in items.items()]
    tree_sha = gh_post(f"repos/{REPO}/git/trees", {"base_tree": tree, "tree": tree_items})
    print(f"  Tree: {tree_sha}")

    print("\n=== Creating commit ===")
    commit = gh_post(f"repos/{REPO}/git/commits", {
        "message": "LOCKED: Apple clean style v4", "tree": tree_sha, "parents": [parent]
    })
    print(f"  Commit: {commit['sha']}")

    print("\n=== Updating ref ===")
    gh_patch(f"repos/{REPO}/git/refs/heads/gh-pages", {"sha": commit["sha"], "force": True})

    print("\n✅ Done: https://ezsatoriyama-pixel.github.io/zero22-football/")

if __name__ == "__main__":
    main()
