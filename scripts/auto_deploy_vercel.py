import subprocess
import json
import time

# 需要你提供 Vercel Token
# 获取方式：https://vercel.com/account/tokens
VERCEL_TOKEN = input("请输入你的 Vercel Token（访问 https://vercel.com/account/tokens 创建）: ").strip()

if not VERCEL_TOKEN:
    print("❌ 需要 Vercel Token 才能继续")
    exit(1)

print("\n🚀 开始自动部署...")

# 1. 创建 Vercel 项目
print("\n📦 步骤 1/4: 创建 Vercel 项目...")
create_project = subprocess.run([
    "curl", "-X", "POST",
    "https://api.vercel.com/v10/projects",
    "-H", f"Authorization: Bearer {VERCEL_TOKEN}",
    "-H", "Content-Type: application/json",
    "-d", json.dumps({
        "name": "zero22-football",
        "framework": "nextjs",
        "gitRepository": {
            "repo": "ezsatoriyama-pixel/zero22-football",
            "type": "github"
        }
    })
], capture_output=True, text=True)

if create_project.returncode != 0:
    print(f"❌ 创建项目失败: {create_project.stderr}")
    exit(1)

project_data = json.loads(create_project.stdout)
project_id = project_data.get("id")
print(f"✅ 项目已创建: {project_id}")

# 2. 触发首次部署
print("\n🔨 步骤 2/4: 触发首次部署...")
time.sleep(3)
deploy = subprocess.run([
    "curl", "-X", "POST",
    f"https://api.vercel.com/v13/deployments",
    "-H", f"Authorization: Bearer {VERCEL_TOKEN}",
    "-H", "Content-Type: application/json",
    "-d", json.dumps({
        "name": "zero22-football",
        "project": project_id,
        "gitSource": {
            "type": "github",
            "repo": "ezsatoriyama-pixel/zero22-football",
            "ref": "main"
        }
    })
], capture_output=True, text=True)

if deploy.returncode != 0:
    print(f"❌ 部署失败: {deploy.stderr}")
    exit(1)

deploy_data = json.loads(deploy.stdout)
deployment_url = deploy_data.get("url")
print(f"✅ 部署已触发: https://{deployment_url}")

# 3. 等待部署完成
print("\n⏳ 步骤 3/4: 等待部署完成（约 2-3 分钟）...")
deployment_id = deploy_data.get("id")
for i in range(60):
    time.sleep(5)
    status = subprocess.run([
        "curl", "-s",
        f"https://api.vercel.com/v13/deployments/{deployment_id}",
        "-H", f"Authorization: Bearer {VERCEL_TOKEN}"
    ], capture_output=True, text=True)
    
    status_data = json.loads(status.stdout)
    state = status_data.get("readyState")
    
    if state == "READY":
        print(f"✅ 部署成功！")
        break
    elif state == "ERROR":
        print(f"❌ 部署失败: {status_data.get('error')}")
        exit(1)
    else:
        print(f"   进度: {state} ({i*5}秒)")

# 4. 输出最终地址
print(f"\n🎉 部署完成！")
print(f"\n访问地址: https://{deployment_url}")
print(f"管理后台: https://{deployment_url}/admin")
print(f"密码: zero22admin")
print(f"\n⚠️ 注意: 管理后台需要配置 Upstash Redis 才能正常使用")
print(f"\n下一步:")
print(f"1. 访问 https://vercel.com/{project_id}")
print(f"2. 点击 Storage → Create Database → Upstash Redis")
print(f"3. 创建后点击 Redeploy 重新部署")
