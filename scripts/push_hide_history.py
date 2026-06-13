import subprocess, json, base64, os

REPO='ezsatoriyama-pixel/zero22-football'
GH=r'C:\Program Files\GitHub CLI\gh.exe'
BASE=r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict'

files = ['lib/mockData.ts', 'app/history/page.tsx']

ref = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/refs/heads/main'],capture_output=True,text=True,timeout=30).stdout)
parent = ref['object']['sha']
comm = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/commits/{parent}'],capture_output=True,text=True,timeout=30).stdout)
tree = comm['tree']['sha']

items = []
for f in files:
    with open(os.path.join(BASE,f),'rb') as fh: content=fh.read()
    b64 = base64.b64encode(content).decode()
    blob = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/blobs','--input','-'],input=json.dumps({'content':b64,'encoding':'base64'}),capture_output=True,text=True,timeout=30).stdout)
    items.append({'path':f.replace('\\','/'),'mode':'100644','type':'blob','sha':blob['sha']})
    print(f"  {f} -> {blob['sha'][:12]}")

new_tree = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/trees','--input','-'],input=json.dumps({'base_tree':tree,'tree':items}),capture_output=True,text=True,timeout=30).stdout)
commit = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/commits','--input','-'],input=json.dumps({'message':'feat: hide history until first match completes (2026-06-11 23:00)','tree':new_tree['sha'],'parents':[parent]}),capture_output=True,text=True,timeout=30).stdout)
subprocess.run([GH,'api',f'repos/{REPO}/git/refs/heads/main','-X','PATCH','--input','-'],input=json.dumps({'sha':commit['sha'],'force':True}),capture_output=True,text=True,timeout=30)
print(f"\nOK: {commit['sha']}")
