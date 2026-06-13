# Zero22 AI Football Lab - Vercel 部署指南

## 📋 完整部署步骤

### 第 1 步：登录 Vercel
1. 打开 https://vercel.com/login
2. 选择 **Continue with GitHub**
3. 授权登录（账号：`ezsatoriyama-pixel`）

---

### 第 2 步：导入 GitHub 仓库
1. 访问 https://vercel.com/new
2. 在 **Import Git Repository** 下找到：
   ```
   ezsatoriyama-pixel/zero22-football
   ```
3. 点击右侧的 **Import** 按钮

---

### 第 3 步：配置项目
#### 基础配置（自动检测，无需修改）
- **Framework Preset**: Next.js ✅
- **Root Directory**: `.` 
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### 环境变量（暂时跳过）
点击右下角 **Deploy** 按钮，先完成首次部署。

---

### 第 4 步：等待首次部署
- 预计 2-3 分钟
- 部署完成后会显示：
  ```
  🎉 Your project is live at: https://zero22-football-xxx.vercel.app
  ```
- **⚠️ 此时管理后台无法使用（缺少数据库）**

---

### 第 5 步：添加 Upstash Redis 集成

#### 5.1 进入项目设置
1. 部署成功后，点击项目名进入项目页面
2. 点击顶部 **Storage** 标签
3. 点击 **Create Database**

#### 5.2 创建 Redis 数据库
1. 选择 **Upstash Redis**
2. 点击 **Continue**
3. Database Name: `zero22-football-db`
4. Region: 选择 **Asia-Pacific (Tokyo)** 或 **US-East** （离你最近的区域）
5. 点击 **Create**

#### 5.3 连接数据库到项目
1. 创建完成后，点击 **Connect**
2. 选择你的项目：`zero22-football`
3. 点击 **Connect**
4. Vercel 会自动注入环境变量：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

### 第 6 步：重新部署
1. 返回项目页面
2. 点击顶部 **Deployments** 标签
3. 点击最新部署右侧的 **⋯**（三个点）
4. 选择 **Redeploy**
5. 点击 **Redeploy** 确认

---

### 第 7 步：验证部署

#### 访问网站首页
```
https://你的域名.vercel.app
```

#### 测试注册登录
1. 访问 `/login`
2. 注册新用户：`13900001111` / `test1234`
3. 登录成功后查看首页

#### 访问管理后台
```
https://你的域名.vercel.app/admin
```
- 密码：`zero22admin`
- 查看统计卡片是否显示数据

---

## 🎯 完成后的效果

### ✅ 功能列表
- [x] 107 场世界杯赛事数据
- [x] 用户注册/登录（手机号+密码）
- [x] Pro 会员升级（收款码支付）
- [x] 管理后台统计（总用户/今日新增/Pro 会员/待确认）
- [x] 数据持久化（Upstash Redis）

### 🌐 访问地址
- **网站首页**：`https://你的域名.vercel.app`
- **赛事中心**：`/matches`
- **历史战绩**：`/history`
- **管理后台**：`/admin`

---

## ⚠️ 注意事项

### 关于 vercel.app 域名
- **.app 域名在国内访问可能不稳定**
- 如需稳定访问，建议：
  1. 绑定自己的域名（Vercel 支持，需要备案）
  2. 或使用 Cloudflare Workers 反向代理

### 关于数据存储
- 用户数据存储在 **Upstash Redis**（免费 10,000 条命令/天）
- Pro 申请数据也存在 Redis
- 超出免费额度后需要升级付费计划（$0.2/100K 命令）

---

## 🆘 遇到问题？

### 管理后台显示数据全是 0
**原因**：Redis 连接失败或环境变量未注入

**解决**：
1. 检查 Vercel Dashboard → Settings → Environment Variables
2. 确认存在：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. 如果缺失，重新连接 Redis 数据库

### 部署失败
**查看日志**：
1. Vercel Dashboard → Deployments
2. 点击失败的部署
3. 查看 **Build Logs** 找错误原因

### 国内访问慢/无法访问
**临时方案**：使用梯子访问

**长期方案**：
1. 绑定已备案的中国域名
2. 或使用国内 CDN 加速

---

## 📞 需要帮助

如果遇到任何问题，可以：
1. 查看 Vercel 控制台的错误日志
2. 检查浏览器 Console 的报错信息
3. 告诉我具体问题，我继续帮你排查

---

**部署愉快！🚀**
