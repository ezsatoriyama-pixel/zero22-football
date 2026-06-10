#!/usr/bin/env python3
"""Upload out/ directory to gh-pages branch via GitHub API (clean orphan push)"""
import os, base64, json, requests, time
from pathlib import Path

TOKEN = os.environ.get("GH_TOKEN", "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")
REPO = "ezsatoriyama-pixel/zero22-football"
BRANCH = "gh-pages"
APIBase = f"https://api.github.com/repos/{REPO}/git"
headers = {"Authorization": f"token {TOKEN}", "Content-Type": "application/json"}

OUT_DIR = Path(r"C:\Users\83668\.qwenpaw\workspaces\default\football-predict\out")

def api_post(url, data):
    r = requests.post(url, headers=headers, json=data)
    if r.status_code >= 300:
        print(f"POST {url} failed: {r.status_code} {r.text[:200]}")
    return r.json()

def api_patch(url, data):
    r = requests.patch(url, headers=headers, json=data)
    if r.status_code >= 300:
        print(f"PATCH {url} failed: {r.status_code} {r.text[:200]}")
    return r.json()

def api_get(url):
    r = requests.get(url, headers=headers)
    return r.json()

# Step 1: Create blobs for each file
blobs = []
for root, dirs, files in os.walk(OUT_DIR):
    for fname in files:
        fpath = Path(root) / fname
        rel = str(fpath.relative_to(OUT_DIR)).replace("\\", "/")
        size = fpath.stat().st_size
        if size > 50_000_000:
            print(f"SKIP large file: {rel} ({size} bytes)")
            continue
        content_b64 = base64.b64encode(fpath.read_bytes()).decode("utf-8")
        blob_resp = api_post(f"{APIBase}/blobs", {"content": content_b64, "encoding": "base64"})
        sha = blob_resp.get("sha")
        if not sha:
            print(f"Failed to create blob for {rel}: {blob_resp}")
            continue
        blobs.append({"path": rel, "mode": "100644", "type": "blob", "sha": sha})
        print(f"  blob: {rel} -> {sha[:8]}")

print(f"\nTotal blobs: {len(blobs)}")

# Step 2: Create tree
tree_resp = api_post(f"{APIBase}/trees", {"tree": blobs})
tree_sha = tree_resp.get("sha")
print(f"Tree SHA: {tree_sha}")

# Step 3: Get current gh-pages ref
ref_resp = api_get(f"{APIBase}/refs/heads/{BRANCH}")
parent_sha = ref_resp.get("object", {}).get("sha")
print(f"Current gh-pages parent: {parent_sha}")

# Step 4: Create commit
commit_data = {
    "message": "Apple-style unified design - v2",
    "tree": tree_sha,
    "parents": [parent_sha] if parent_sha else [],
}
commit_resp = api_post(f"{APIBase}/commits", commit_data)
commit_sha = commit_resp.get("sha")
print(f"New commit SHA: {commit_sha}")

# Step 5: Update branch ref
ref_update = api_patch(f"{APIBase}/refs/heads/{BRANCH}", {"sha": commit_sha, "force": True})
print(f"Branch update result: {ref_update.get('object', {}).get('sha', 'FAILED')}")
print("\nDone!")