import subprocess, json, base64, os
REPO='ezsatoriyama-pixel/zero22-football'
GH=r'C:\Program Files\GitHub CLI\gh.exe'
BASE=r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict'
files=['lib/results.ts','app/admin/page.tsx','app/history/page.tsx']
ref=json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/refs/heads/main'],capture_output=True,text=True,timeout=30).stdout)
parent=ref['object']['sha']
comm=json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/commits/{parent}'],capture_output=True,text=True,timeout=30).stdout)
tree_sha=comm['tree']['sha']
items=[]
for f in files:
    data=open(os.path.join(BASE,f),'rb').read()
    blob=json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/blobs','--input','-'],input=json.dumps({'content':base64.b64encode(data).decode(),'encoding':'base64'}),capture_output=True,text=True,timeout=30).stdout)
    items.append({'path':f,'mode':'100644','type':'blob','sha':blob['sha']})
    print('update', f)
new_tree=json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/trees','--input','-'],input=json.dumps({'base_tree':tree_sha,'tree':items}),capture_output=True,text=True,timeout=30).stdout)
commit=json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/commits','--input','-'],input=json.dumps({'message':'feat: add post-match result entry and history statistics loop','tree':new_tree['sha'],'parents':[parent]}),capture_output=True,text=True,timeout=30).stdout)
subprocess.run([GH,'api',f'repos/{REPO}/git/refs/heads/main','-X','PATCH','--input','-'],input=json.dumps({'sha':commit['sha'],'force':True}),capture_output=True,text=True,timeout=30,check=True)
print('OK',commit['sha'])
