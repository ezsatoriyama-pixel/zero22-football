#!/usr/bin/env python3
 """Upload all files from out out/ directory to gh-pages branch on GitHub"""
import os, base64, json, requests
 from pathlib import Path

 from github import Github, InputFile

 ContentFile

 GithubException

TOKEN = "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"
  REPO_NAME = "ezsatoriyama-pixel/zero22-football"
  BRANCH = "gh-pages"

def main():
    g = Github(TOKEN)
    repo = g.get_repo(REPO_NAME)

    # Get current gh-pages branch SHA
 try:
        ref = repo.get_git_ref(f"refs/heads/{BRANCH}")
        current_sha = ref.object.sha
        print(f"Current gh-pages SHA: {current_sha}")

        # Get current tree
 base_tree_commit = repo.get_git_commit(current_sha)
        base_tree = base_tree_commit.tree

    except GithubException:
        print("gh-pages branch not found or empty, creating fresh orphan commit")
        # Create empty orphan branch via API
        url = f"https://api.github.com/repos/{REPO_NAME}/git/commits"
        headers = {"Authorization": f"token {TOKEN}"}
        # Create an empty tree
        data = {
            "message": "Initial gh-pages commit",
            "tree": None
        }
        resp = requests.post(url, headers=headers, json=data)
        result = resp.json()
        new_sha = result["sha"]
        # Create branch reference
        url2 = f"https://api.github.com/repos/{REPO_NAME}/git/refs/heads/{BRANCH}"
        data2 = {"sha": new_sha}
        requests.post(url2, headers=headers, json=data2)
        base_tree = None
        current_sha = new_sha

    # Collect all files from out/ directory
    out_dir = Path(r"C:\\Users\\83668\\.qwenpaw\\workspaces\\default\\football-predict\\out")
    files_to_upload = {}
    for root, dirs, filenames in os.walk(out_dir):
        for fname in filenames:
            fpath = Path(root) / fname
            rel_path = str(fpath.relative_to(out_dir)).replace("\\", "/")
            # Skip node_modules and large binary files
            if rel_path.startswith("node_modules") or fpath.stat().st_size() > 50 * 1024 * 1024:  # > 50MB
                continue
            content_bytes = fpath.read_bytes()
            content_b64 = base64.b64encode(content_bytes).decode("utf-8")
            files_to_upload[rel_path] = {
                "path": rel_path,
                "mode": "100644",
                "type": "blob",
                "content": content_b64
            }

    print(f"Files to upload: {len(files_to_upload)}")

    # Create blobs for each file
    new_tree_entries = []
    for rel_path, file_data in files_to_upload.items():
        # Create blob via API
        url = f"https://api.github.com/repos/{REPO_NAME}/git/blobs"
        headers = {"Authorization": f"token {TOKEN}", "Content-Type": "application/json"}
        data = {
            "content": file_data["content"],
            "encoding": "base64"
        }
        resp = requests.post(url, headers=headers, json=data)
        blob_sha = resp.json()["sha"]
        new_tree_entries.append({
            "path": file_data["path"],
            "mode": file_data["mode"],
            "type": file_data["type"],
            "sha": blob_sha,
        })

    print(f"Blobs created: {len(new_tree_entries)}")

    # Create new tree
    url = f"https://api.github.com/repos/{REPO_NAME}/git/trees"
    data = {
        "base_tree": base_tree if base_tree else None,
        "tree": new_tree_entries
    }
    resp = requests.post(url, headers=headers, json=data)
    new_tree_sha = resp.json()["sha"]
    print(f"New tree SHA: {new_tree_sha}")

    # Create new commit
    url = f"https://api.github.com/repos/{REPO_NAME}/git/commits"
    data = {
        "message": "Restore Apple-style unified design",
        "tree": new_tree_sha,
        "parents": [current_sha] if current_sha else []
]
    }
    resp = requests.post(url, headers=headers, json=data)
    new_commit_sha = resp.json()["sha"]
    print(f"New commit SHA: {new_commit_sha}")

    # Update branch reference
    url = f"https://api.github.com/repos/{REPO_NAME}/git/refs/heads/{BRANCH}"
    data = {"sha": new_commit_sha}
    resp = requests.patch(url, headers=headers, json=data)
    print(f"Branch updated: {resp.status_code}")
    print(f"Done! gh-pages branch updated with new static content.")