# Zero22 Football 项目交接给 Codex

## 目标

- 构建并运行完整足球预测网站 `football-predict`
- 网站名：**Zero22 AI Football Lab**
- 当前正式部署：**GitHub Pages 静态站**
- 风格：极简苹果风、白色背景 `#f8fafc`、卡片圆角 `24px`、阴影 `0 8px 30px rgba(0,0,0,0.05)`、最大宽度 `1200px`
- 页面包含：首页、赛事中心、比赛详情页、历史战绩页、登录 / 注册、Pro 会员解锁、管理后台、免责声明、Pro 会员条款
- Pro 内容：
  - “基于 10,000 场比赛 / 蒙特卡洛模拟”
  - 价格：**29.9 元永久会员**
  - 支付：**微信支付 + 支付宝个人收款码**
  - 付款后备注手机号 / 加微信获取激活码
- 登录方式：**手机号 + 密码**
- 赛程目标：
  - 已按用户上传的 10 张赛程图录入 72 场世界杯小组赛
  - 首页“今日赛事”每天根据浏览器日期自动更新
  - 赛事中心按日期时间排序
- 预测模型目标：
  - 不再冒充“必中比分”
  - 主推比分保留基础模型优势
  - 风险模型用于防冷、置信度、爆冷指数、TOP5 覆盖提示
  - 当前模型名：**Zero22 Net v4.1 双模型融合**
- 历史战绩目标：
  - 不显示假数据
  - 只记录已录入真实比分的比赛
  - 支持后台赛后比分录入
  - 自动统计：已录入赛果、主推比分命中、TOP5 覆盖、胜平负方向命中、命中率

---

## 约束和偏好

- 极简苹果风，参考 Apple 官网 / Notion / Linear
- 白色背景，不要黑色背景
- 不要超大图标、不要占位圆环或旗帜
- 免费用户可查看基础预测；Pro 解锁完整比分矩阵和深度分析
- 登录必须是**手机号 + 密码**
- Pro 会员是**永久会员**
- 支付只保留**微信 + 支付宝**，Stripe 已全部移除
- 支付时提醒用户备注手机号，并加微信 `HJ0626139`
- 用户不接受“桌面 / 手机两套排版”，要求统一视觉风格
- 个人收款码无支付回调：采用“付款 → 加微信 → 管理员发激活码 → 用户自助激活 Pro”
- GitHub Pages 是静态站：
  - 不支持 Next.js API 路由
  - 不支持服务端数据库
  - 不支持服务端定时任务
  - 用户注册、Pro 激活、赛果录入主要依赖浏览器 `localStorage`
- 历史真实比分不能自动抓官方比分：需要管理员赛后录入真实比分
- 预测展示必须避免绝对化：
  - “最高概率比分”不等于确定赛果
  - 精确比分单场命中率现实预估：`8% - 16%`
  - TOP5 比分覆盖率预估：`35% - 55%`
  - 胜平负方向命中率预估：`52% - 65%`

---

## 当前项目位置

- 项目根目录：
  - `C:\Users\83668\.qwenpaw\workspaces\default\football-predict`
- GitHub 仓库：
  - `https://github.com/ezsatoriyama-pixel/zero22-football`
- GitHub Pages 地址：
  - `https://ezsatoriyama-pixel.github.io/zero22-football/`
- 本地开发地址：
  - `http://localhost:3000/zero22-football`
- 管理后台：
  - `/zero22-football/admin`
  - 密码：`zero22admin`
- 用户微信号：
  - `HJ0626139`

---

## 已完成事项

### 基础网站与部署

- [x] 创建并运行 Next.js 项目
- [x] 完成首页、赛事中心、比赛详情、历史战绩、登录注册、Pro 弹窗、管理后台
- [x] 网站名改为 **Zero22 AI Football Lab**
- [x] Pro 内容改为“10,000 场数据 / 蒙特卡洛模拟”
- [x] Pro 改为 **29.9 元永久会员**
- [x] 登录注册改为手机号 + 密码
- [x] Stripe 全部移除
- [x] 收款方式改为支付宝 + 微信个人收款码
- [x] 用户上传并替换收款码：
  - `public/qr-1.jpg`：支付宝
  - `public/qr-2.jpg`：微信支付
- [x] 修复 GitHub Pages 图片 basePath 问题：
  - `components/ProModal.tsx` 使用 `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/qr-1.jpg`
  - `next.config.js` 增加：
    - `basePath: '/zero22-football'`
    - `env.NEXT_PUBLIC_BASE_PATH = '/zero22-football'`
  - commit：`a77e9b104c839c8d201b7d1c5c2a75791c24fa41`
- [x] GitHub Pages 部署成功：
  - `https://ezsatoriyama-pixel.github.io/zero22-football/`
- [x] GitHub Actions 自动部署成功
- [x] 本地管理后台验证成功：
  - 地址：`http://localhost:3000/zero22-football/admin`
  - 密码：`zero22admin`

### 赛程、页面与文案

- [x] 删除未公布淘汰赛 / 友谊赛，只保留 72 场小组赛
  - 修改文件：`lib/mockData.ts`
  - commit：`b1d624eed452ac50fb161ed6dbbf466d34326e62`
- [x] 新增免责声明页面：`app/disclaimer/page.tsx`
- [x] 新增 Pro 会员条款页面：`app/pro-terms/page.tsx`
- [x] Footer 新增链接：免责声明、Pro 会员条款、管理后台、GitHub
  - 修改文件：`components/Footer.tsx`
  - commit：`d08420def8e487c9ca6e46c227c214f6e3eb8122`
- [x] 用户上传 10 张赛程图后，使用本地 OCR 处理
  - 安装：`rapidocr-onnxruntime`
  - OCR 脚本：`scripts/ocr_schedule.py`
  - OCR 输出：`ocr_schedule.txt`
  - OCR 修正：`00:60` → `06:00`，`00:90` → `09:00`
- [x] 按用户上传赛程图重建 72 场小组赛
  - 脚本：`scripts/rewrite_schedule_from_images.py`
  - 修改文件：`lib/mockData.ts`
  - 本地构建通过：`Generating static pages (83/83)`
  - commit：`52ce24440577f28169c2fd40dd46e172273282c0`
  - 线上验证赛事中心首场：
    - `2026-06-12 03:00 墨西哥 VS 南非`
    - `2026-06-12 10:00 韩国 VS 捷克`
- [x] 更新赛程相关文案：
  - `app/page.tsx`：“官方确认后校准” → “已按赛程表录入”
  - `app/matches/page.tsx`：说明按用户提供赛程表录入
  - `app/history/page.tsx`：首场时间改为 `2026-06-12 03:00`

### 激活码与 Pro 系统

- [x] 完成激活码自服务系统：
  - 文件：`lib/activationCodes.ts`
  - 预置 100 个激活码：`Z22-PRO-001A` ~ `Z22-PRO-100D`
  - 函数：
    - `validateActivationCode`
    - `consumeActivationCode`
    - `getAvailableCodes`
    - `getUsedCodesList`
- [x] 重写 `components/ProModal.tsx`
  - 显示支付宝 / 微信收款码
  - 显示微信号：`HJ0626139`
  - 提示“付款后加微信获取激活码”
  - 支持输入激活码自助升级 Pro
- [x] 重写 `app/admin/page.tsx`
  - 管理后台支持：可用激活码、已使用激活码、复制激活码
- [x] 修复 `lib/auth.tsx` 中旧的 `isApprovedByApi` 引用错误
- [x] 删除本地 `app/api`，解决静态导出错误
- [x] 激活码系统上线
  - commit：`dfdaa942b3e9cdc91896d5d089db753cbdcdbf23`
- [x] 修复赛事排序、登录持久化、历史假数据、首页假统计等问题并上线
  - 修改：`lib/auth.tsx`、`lib/mockData.ts`、`app/page.tsx`、`app/matches/page.tsx`
  - 删除远端残留 API：`app/api/stats/route.ts`、`app/api/users/route.ts`
  - commit：`57a4935e02aaf03f6b4e6389feb7acd4d2a9fe06`
- [x] `lib/auth.tsx` 已重写为更稳的账号持久化版本：
  - 手机号标准化 `normalizePhone`
  - 账号迁移：`zero22-accounts`、`users`、`fp-users`、`zero22-user`、`fp-user`
  - 自动清理旧 key
  - 注册时写入 `createdAt`

### 模型与预测展示

- [x] 将预测模型升级为 **Zero22 Net v4 风险修正模型**
  - 脚本：`scripts/upgrade_model.py`
  - 修改文件：`lib/mockData.ts`、`app/matches/[id]/page.tsx`
  - 新增因素：状态代理、主办国 / 主场环境、南美球队对抗特征、球队风格、赔率变化代理、小组赛轮次风险、足球随机性扰动、爆冷指数、风险评级
  - commit：`646beb783c86149ba11cf9a767db4cac34585cfc`
- [x] 修复比分展示文案：
  - `推荐比分 TOP3` → `推荐比分 TOP5`
  - 添加说明：“最高概率比分代表模型最可能区间，不等于确定赛果”
  - 手机端布局：`grid-cols-2` → `grid-cols-1 lg:grid-cols-2`
  - commit：`03241f8168323aab9f6f97f06744282916574583`
- [x] 按用户要求改成“双模型融合”
  - 模型 A：基础命中模型
  - 模型 B：风险修正模型
  - 模型 C：融合模型
  - 脚本：`scripts/dual_fusion.py`
  - 文件：`lib/mockData.ts`、`app/matches/[id]/page.tsx`
  - 模型名更新：`Zero22 Net v4.1 双模型融合`
  - commit：`fc63f36c03e288d834bc87e61911377334e3b1eb`
- [x] 用户指出算法升级导致之前两场预测比分变了，这是产品问题
  - 已修复为“发布稳定融合”
  - 主推比分优先保留基础模型
  - 风险模型只用于防冷、置信度、风险评级和 TOP5 分布
  - 脚本：`scripts/stable_fusion.py`
  - commit：`a0b0e707340f83f44b790fb9e538b74ac0d23f74`
- [x] 美国 vs 巴拉圭稳定融合线上验证：
  - 主胜 `48%`，平局 `28%`，客胜 `24%`
  - TOP5：`1:0 13.6%`、`1:1 12.2%`、`2:0 10.2%`、`2:1 9.2%`、`0:0 9.1%`
  - AI 摘要：基础模型主推 `1:0`，风险修正参考 `1:1`，当前发布主推比分 `1:0`，置信度中低，风险评级较高

### 今日赛事与历史战绩

- [x] 首页“今日赛事”每天自动更新
  - 文件：`app/page.tsx`
  - 脚本：`scripts/update_daily_home.py`
  - 函数：`toLocalDateString`、`getDailyMatches`
  - 逻辑：今天有比赛显示“今日赛事”；没比赛显示“下一比赛日”；赛程结束显示“近期赛事”
  - commit：`07616479345ccdd9d948c849fc7c2e88ce29c236`
- [x] 历史战绩页重写为正式统计页
  - 文件：`app/history/page.tsx`
  - 脚本：`scripts/rewrite_history_page.py`
  - 文案：“只记录已完赛并录入真实比分的比赛，不用模拟比分冒充战绩”
  - 空状态：“暂无已确认历史战绩”
  - commit：`07616479345ccdd9d948c849fc7c2e88ce29c236`
- [x] 新增赛后比分录入与历史统计闭环核心逻辑
  - 新文件：`lib/results.ts`
  - 类型：`StoredResult`、`HistoryStatRecord`
  - localStorage key：`zero22-match-results`
  - 函数：
    - `parseScore`
    - `scoreOutcome`
    - `getAllResults`
    - `getResultForMatch`
    - `saveMatchResult`
    - `deleteMatchResult`
    - `isExactScore`
    - `isTop5Score`
    - `isOutcomeHit`
    - `buildHistoryRecords`
    - `percentage`
- [x] 管理后台新增“赛果录入”能力
  - 文件：`app/admin/page.tsx`
  - 支持：选择比赛、输入实际比分如 `2:1`、保存到 localStorage、删除已录入比分、自动刷新统计
  - 后台 tab：`results`、`available`、`used`
  - 仍支持激活码管理
- [x] 历史战绩页改为读取 `lib/results.ts`
  - 文件：`app/history/page.tsx`
  - 读取：`worldCupMatches`、`buildHistoryRecords`、`percentage`
  - 自动显示：已录入赛果、主推比分命中、TOP5 覆盖、胜平负命中
- [x] 曾尝试给比赛详情页加入赛果展示，但污染了文件
  - 构建错误：`Unexpected token div. Expected jsx identifier`
  - 位置：`app/matches/[id]/page.tsx:59`
  - 原因：插入 `ResultBadge` 时使用全局替换导致文件污染
  - 已从 GitHub 远端恢复干净版本
  - 恢复后构建成功
- [x] 先上线“后台录入 + 历史统计闭环”可用版本
  - 推送文件：`lib/results.ts`、`app/admin/page.tsx`、`app/history/page.tsx`
  - commit：`b573bd32f12b431df59f804760ef4ea3a77118d0`
  - GitHub Actions：`completed success`

---

## 当前进行中 / 下一步

### 1. 验证后台赛果录入完整流程

- 打开：
  - `https://ezsatoriyama-pixel.github.io/zero22-football/admin?v=b573`
- 输入密码：
  - `zero22admin`
- 当前状态：之前已打开后台登录页并看到输入框，已执行输入密码动作
- 还需要继续：
  - 确认是否进入后台
  - 找到“赛果录入”tab
  - 给一场比赛录入实际比分，如 `1:0`
  - 保存后刷新确认仍存在
  - 验证 localStorage 写入

### 2. 验证历史统计闭环

- 打开：
  - `https://ezsatoriyama-pixel.github.io/zero22-football/history?v=b573`
- 确认显示：
  - 已录入赛果数量
  - 主推比分命中率
  - TOP5 覆盖率
  - 胜平负命中率

### 3. 重新安全修改比赛详情页

目标文件：

- `app/matches/[id]/page.tsx`

注意：

- 之前因为全局替换污染过该文件
- 这次必须使用**小范围精确 patch**
- 不要全局替换 `}\n`

目标功能：如果某场已录入实际比分，则详情页显示：

- 实际比分
- 主推比分
- 精确比分是否命中
- TOP5 是否覆盖
- 胜平负方向是否命中

### 4. 构建验证

在项目根目录执行：

```cmd
cd /d C:\Users\83668\.qwenpaw\workspaces\default\football-predict && npm run build
```

期望看到：

```text
Generating static pages (83/83)
```

### 5. 推送详情页赛果展示

- 修改文件：`app/matches/[id]/page.tsx`
- 构建通过后 commit + push
- 线上验证某场详情页：
  - `https://ezsatoriyama-pixel.github.io/zero22-football/matches/wc-d1-01`
- 录入赛果后确认显示：
  - 实际比分
  - 主推比分
  - 精确 / TOP5 / 胜平负判定

### 6. 继续测试登录注册持久化

- 注册
- 退出
- 重新登录
- 刷新保持登录

### 7. 测试 Pro 激活码完整流程

- 普通用户登录
- 打开 Pro 弹窗
- 输入未使用激活码
- 确认升级 Pro
- 再次输入同码应提示已使用

### 8. 如果需要真正全网共享历史战绩

当前 GitHub Pages 静态站无法全网共享 localStorage 数据。可评估迁移：

- Vercel + Supabase
- LeanCloud
- Firebase
- 或其他后端数据库方案

---

## 阻塞 / 限制

- GitHub Pages 是静态站：
  - 无后端服务器
  - 无数据库
  - 无定时任务
  - 无官方比分 API 自动抓取
- 当前用户账号、Pro 状态、后台赛果录入都在当前浏览器 localStorage：
  - 换设备 / 换浏览器 / 清缓存会丢失
  - 管理员录入赛果只对该浏览器有效
  - 如需所有用户看到同一份赛果，必须把真实比分写入代码并重新发布，或接入数据库
- 个人收款码无自动支付回调：继续使用“付款后加微信 HJ0626139 获取激活码”
- 精确比分天然命中率不高：
  - 单一主推比分约 `8% - 16%`
  - TOP5 覆盖约 `35% - 55%`
  - 胜平负方向约 `52% - 65%`
- 之前 FIFA 官方页面无法访问：
  - FIFA 页面异常：`Come on referee, you weren't supposed to see this!`
  - Google 搜索被验证码拦截
  - 目前采用用户提供的 10 张赛程截图作为录入依据

---

## 关键决策

- **GitHub Pages 作为当前正式公开站**：免费、稳定、已上线，但只能做静态功能
- **Pro 交付采用激活码自服务**：付款后加微信 `HJ0626139`，管理员发激活码，用户输入激活码升级
- **不再冒充官方赛程 / 官方数据**：当前 72 场赛程来自用户提供截图，文案为“按你提供的赛程表录入”
- **历史战绩不显示假数据**：没有真实比分时为空状态，只有录入真实比分后才统计
- **今日赛事使用浏览器端日期自动筛选**：GitHub Pages 无定时任务
- **预测模型采用 v4.1 双模型融合**：基础模型负责主推命中，风险模型负责防冷和置信度
- **发布稳定优先**：不能因为算法升级就悄悄改掉已展示过的主推比分
- **比分预测展示更保守**：明确“最高概率比分代表模型最可能区间，不等于确定赛果”
- **赛后比分录入先做静态站可用闭环**：管理后台录入 localStorage，历史页读取 localStorage 统计；若要全网共享，未来接数据库

---

## 重要文件

- `app/page.tsx`：首页 / 今日赛事自动更新
- `app/history/page.tsx`：历史战绩页
- `app/admin/page.tsx`：管理后台 / 赛果录入 / 激活码
- `app/matches/[id]/page.tsx`：比赛详情页
- `app/matches/page.tsx`：赛事中心
- `lib/mockData.ts`：赛程和预测模型数据
- `lib/results.ts`：赛后比分录入与历史统计逻辑
- `lib/auth.tsx`：登录注册 / Pro 状态
- `lib/activationCodes.ts`：激活码系统
- `components/ProModal.tsx`：Pro 支付弹窗 / 激活码输入
- `components/Footer.tsx`：页脚
- `components/Header.tsx`：顶部导航
- `public/qr-1.jpg`：支付宝收款码
- `public/qr-2.jpg`：微信收款码

---

## 关键脚本

### 赛程 OCR 相关

- 图片位置：
  - `C:\Users\83668\.qwenpaw\workspaces\default\media\...`
- OCR 脚本：
  - `scripts/ocr_schedule.py`
- OCR 结果：
  - `ocr_schedule.txt`
- 赛程重写脚本：
  - `scripts/rewrite_schedule_from_images.py`

### 模型相关脚本

- `scripts/upgrade_model.py`
- `scripts/dual_fusion.py`
- `scripts/stable_fusion.py`

### 推送脚本

- `scripts/push_bugfixes.py`
- `scripts/push_schedule.py`
- `scripts/push_model_v4.py`
- `scripts/push_score_ui.py`
- `scripts/push_dual_model.py`
- `scripts/push_stable_fusion.py`
- `scripts/push_history_daily.py`
- `scripts/push_results_loop.py`

---

## 关键 commit

- `a77e9b104c839c8d201b7d1c5c2a75791c24fa41`：修复二维码 basePath
- `b1d624eed452ac50fb161ed6dbbf466d34326e62`：只保留 72 场小组赛
- `7f2df7a7a6c9f354a92e3b93ed4d75418131ee83`：历史战绩清空上线
- `d08420def8e487c9ca6e46c227c214f6e3eb8122`：免责声明和 Pro 条款
- `dfdaa942b3e9cdc91896d5d089db753cbdcdbf23`：激活码自服务系统
- `57a4935e02aaf03f6b4e6389feb7acd4d2a9fe06`：登录持久化、排序、历史假数据修复、删除远端 API
- `52ce24440577f28169c2fd40dd46e172273282c0`：按用户赛程图录入 72 场
- `646beb783c86149ba11cf9a767db4cac34585cfc`：v4 风险修正模型
- `03241f8168323aab9f6f97f06744282916574583`：TOP5 文案和手机端布局
- `fc63f36c03e288d834bc87e61911377334e3b1eb`：v4.1 双模型融合
- `a0b0e707340f83f44b790fb9e538b74ac0d23f74`：稳定融合，主推保留基础模型
- `07616479345ccdd9d948c849fc7c2e88ce29c236`：今日赛事自动更新 + 历史战绩重写
- `b573bd32f12b431df59f804760ef4ea3a77118d0`：赛后比分录入 + 历史统计闭环

---

## 最近成功构建

多次显示：

```text
Generating static pages (83/83)
```

---

## 最近重要错误

- 错误：`Unexpected token div. Expected jsx identifier`
- 文件：`app/matches/[id]/page.tsx`
- 原因：追加 `ResultBadge` 时全局替换污染文件
- 处理：已从 GitHub 远端恢复该文件干净版本
- 后续注意：修改详情页必须用小范围 patch，不要做全局替换
