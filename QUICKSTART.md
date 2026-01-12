# 快速入门指南

本指南帮助你快速部署和使用金融法规监控系统。

## 📋 系统功能

自动监控以下网站的法规更新：

- **深圳证券交易所** (http://www.szse.cn/lawrules/index.html)
- **中国证监会** (http://www.csrc.gov.cn/csrc/c101953/zfxxgk_zdgk.shtml)

发现新规则时，会通过邮件通知你。

## 🚀 5分钟快速部署

### 第1步：准备QQ邮箱授权码（2分钟）

1. 登录QQ邮箱：https://mail.qq.com
2. 点击【设置】→【账户】
3. 找到【POP3/SMTP服务】
4. 点击【开启服务】
5. 按提示发送短信
6. 复制生成的**授权码**（16位字符，不是QQ密码）

**保存好这个授权码，后面要用！**

### 第2步：上传代码到GitHub（2分钟）

#### 方式一：网页上传（简单）

1. 登录GitHub，创建新仓库
2. 点击【Upload files】
3. 上传以下内容：
   - `src/` 文件夹
   - `data/` 文件夹
   - `.github/` 文件夹
   - `package.json`
   - `.env.example`
   - `README.md`
   - `.gitignore`

#### 方式二：Git命令（推荐开发者）

```bash
cd financial-web-monitor
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/financial-web-monitor.git
git push -u origin main
```

### 第3步：配置Secrets（1分钟）

1. 进入你的GitHub仓库
2. 点击【Settings】→【Secrets and variables】→【Actions】
3. 点击【New repository secret】，添加3个配置：

| Secret名称 | 填写内容 |
|-----------|---------|
| `QQ_EMAIL` | 你的QQ邮箱（如：12345678@qq.com） |
| `QQ_AUTH_CODE` | 刚才的QQ邮箱授权码（16位字符） |
| `RECEIVER_EMAIL` | 接收通知的邮箱（可以是任何邮箱） |

### 第4步：测试运行（30秒）

1. 点击【Actions】标签
2. 点击【Financial Web Monitor】工作流
3. 点击【Run workflow】→【Run workflow】
4. 等待执行完成（约30秒）

✅ 完成！系统已开始自动运行。

## 📊 查看结果

### 首次运行

- 系统会初始化历史数据
- 不会发送邮件（因为没有历史数据对比）
- 查看 `data/history.json` 确认数据已抓取

### 后续运行

- 每天**北京时间早上8:00**自动检查
- 如果发现新规则，会发送邮件通知
- 邮件包含：规则标题、发布日期、查看链接

### 手动测试

如果想测试邮件功能：

1. 打开仓库的 `data/history.json` 文件
2. 删除其中一个网站的数据（如删除 `szse` 部分）
3. 再次运行工作流（Actions → Run workflow）
4. 应该会收到测试邮件

## 📧 邮件通知示例

收到邮件时的样子：

```
主题：【金融法规更新】发现2条新规则 - 深圳证券交易所

检测时间：2026-01-12 08:00

本次监控发现 2 条新规则/政策
涉及网站：深圳证券交易所

【深圳证券交易所】

1. 深圳证券交易所创业板股票上市规则（2024年修订）
   📅 发布日期：2026-01-11
   [查看详情]

2. 深圳证券交易所交易规则（2024年修订）
   📅 发布日期：2026-01-10
   [查看详情]
```

## ⚙️ 修改运行时间

默认每天早上8点运行，如需修改：

1. 编辑 `.github/workflows/daily-monitor.yml`
2. 修改 cron 表达式（UTC时间）：

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 每天UTC 0:00（北京时间8:00）
```

常用时间：
- 每天8点：`0 0 * * *`
- 每天9点：`0 1 * * *`
- 每两小时：`0 */2 * * *`

3. 提交代码，修改立即生效

## 🔧 本地运行测试

如果想先在本地测试：

1. 复制环境变量文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env`，填入实际值：
   ```
   QQ_EMAIL=你的QQ邮箱
   QQ_AUTH_CODE=你的QQ授权码
   RECEIVER_EMAIL=接收通知的邮箱
   ```

3. 运行测试：
   ```bash
   npm test
   ```

## ❓ 常见问题

### 收不到邮件？

可能原因：
1. 首次运行不发送邮件（正常）
2. QQ邮箱授权码错误（检查Secret配置）
3. 邮件被拦截（检查垃圾邮件箱）

### 看不到Actions页面？

需要在仓库设置中启用：
1. Settings → Actions → General
2. 找到 "Actions permissions"
3. 选择 "Allow all actions and reusable workflows"

### 定时任务没执行？

检查：
1. Actions是否已启用
2. 工作流配置是否正确
3. GitHub服务是否正常

可以在Actions页面手动触发测试。

### 想增加更多网站？

需要修改代码，参考 `DEPLOYMENT.md` 中的扩展部分。

## 📚 更多文档

- **详细文档**: 查看 `README.md`
- **部署指南**: 查看 `DEPLOYMENT.md`
- **问题反馈**: 在GitHub Issues提交

## 💡 提示

- 系统每天自动运行一次，无需手动操作
- 历史数据保存在 `data/history.json`
- 可以在Actions页面查看执行日志
- 每次执行都会自动提交数据更新到仓库

## 🔐 安全提醒

- QQ邮箱授权码不是QQ密码
- 不要将 `.env` 文件上传到GitHub
- 定期更换授权码（建议每3-6个月）
- 仓库如果是私有的，谨慎添加协作者

---

祝你使用愉快！
