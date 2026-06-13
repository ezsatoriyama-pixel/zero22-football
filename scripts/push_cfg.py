import subprocess, json, base64

REPO='ezsatoriyama-pixel/zero22-football'
GH=r'C:\Program Files\GitHub CLI\gh.exe'
config_path=r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict\next.config.js'

with open(config_path, 'r') as f:
    content = f.read()

ref = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/refs/heads/main'],
    capture_output=True, text=True, timeout=30).stdout)
parent = ref['object']['sha']
comm = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/commits/{parent}'],
    capture_output=True, text=True, timeout=30).stdout)
tree = comm['tree']['sha']

b64 = base64.b64encode(content.encode()).decode()
blob = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/blobs','--input','-'],
    input=json.dumps({'content':b64,'encoding':'base64'}), capture_output=True, text=True, timeout=30).stdout)

new_tree = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/trees','--input','-'],
    input=json.dumps({'base_tree':tree,'tree':[{'path':'next.config.js','mode':'100644','type':'blob','sha':blob['sha']}]}),
    capture_output=True, text=True, timeout=30).stdout)

commit = json.loads(subprocess.run([GH,'api',f'repos/{REPO}/git/commits','--input','-'],
    input=json.dumps({'message':'fix: add output export + basePath','tree':new_tree['sha'],'parents':[parent]}),
    capture_output=True, text=True, timeout=30).stdout)

subprocess.run([GH,'api',f'repos/{REPO}/git/refs/heads/main','-X','PATCH','--input','-'],
    input=json.dumps({'sha':commit['sha'],'force':True}), capture_output=True, text=True, timeout=30)

print(f'Pushed: {commit["sha"]}')
