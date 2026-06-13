import subprocess, json, base64, os

REPO='ezsatoriyama-pixel/zero22-football'
GH=r'C:\Program Files\GitHub CLI\gh.exe'
BASE=r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict'

files_to_push = [
    'app/api/users/route.ts',
    'app/api/stats/route.ts',
    'package.json',
    'package-lock.json',
    '.env.example',
]

ref = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/refs/heads/main'],
    capture_output=True, text=True, timeout=30).stdout)
parent = ref['object']['sha']
comm = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/commits/{parent}'],
    capture_output=True, text=True, timeout=30).stdout)
tree = comm['tree']['sha']

tree_items = []
for path in files_to_push:
    fpath = os.path.join(BASE, path)
    if not os.path.exists(fpath):
        print(f"SKIP: {path}")
        continue
    with open(fpath, 'rb') as f:
        content = f.read()
    b64 = base64.b64encode(content).decode()
    blob = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/blobs','--input','-'],
        input=json.dumps({'content':b64,'encoding':'base64'}), capture_output=True, text=True, timeout=30).stdout)
    path_u = path.replace('\\','/')
    tree_items.append({'path': path_u, 'mode': '100644', 'type': 'blob', 'sha': blob['sha']})
    print(f"  {path_u} -> {blob['sha'][:12]}")

new_tree = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/trees','--input','-'],
    input=json.dumps({'base_tree':tree,'tree':tree_items}), capture_output=True, text=True, timeout=30).stdout)

commit = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/commits','--input','-'],
    input=json.dumps({'message':'feat: integrate Upstash Redis for Vercel','tree':new_tree['sha'],'parents':[parent]}),
    capture_output=True, text=True, timeout=30).stdout)

subprocess.run([GH,'api',f'repos/{REPO}/git/refs/heads/main','-X','PATCH','--input','-'],
    input=json.dumps({'sha':commit['sha'],'force':True}), capture_output=True, text=True, timeout=30)

print(f"\nOK commit={commit['sha']}")
print("\nNext steps:")
print("1. Go to https://vercel.com/new")
print("2. Import ezsatoriyama-pixel/zero22-football")
print("3. Add Upstash Redis integration from Marketplace")
print("4. Deploy!")
