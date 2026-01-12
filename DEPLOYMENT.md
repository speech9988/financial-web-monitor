# 部署指南

本文档详细说明如何部署金融法规监控系统到GitHub Actions。

## 前置要求

- GitHub账户
- QQ邮箱（用于发送通知）
- 接收通知的邮箱

## 部署步骤

### 步骤1: 上传代码到GitHub

#### 方式一：通过GitHub网页上传

1. 登录GitHub，创建新仓库（命名为 `financial-web-monitor`）
2. 进入仓库页面
3. 点击【Upload files】或【Add file】→【Upload files】
4. 将以下文件/文件夹拖拽上传：
   - `src/` 文件夹（包含所有.js文件）
   - `.github/` 文件夹
   - `data/` 文件夹
   - `package.json`
   - `.env.example`
   - `README.md`
   - `.gitignore`

#### 方式二：通过Git命令上传

```bash
cd financial-web-monitor

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Financial web monitor"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/yourusername/financial-web-monitor.git

# 推送代码
git push -u origin master
# 或者如果主分支是main
git push -u origin main
```

### 步骤2: 配置GitHub Secrets

1. 进入你的GitHub仓库
2. 点击【Settings】标签
3. 左侧菜单点击【Secrets and variables】→【Actions】
4. 点击【New repository secret】按钮

#### 配置QQ邮箱Secret

- **Name**: `QQ_EMAIL`
- **Value**: 你的QQ邮箱地址（例如：yourname@qq.com）
- 点击【Add secret】

#### 配置QQ授权码Secret

- **Name**: `QQ_AUTH_CODE`
- **Value**: 你的QQ邮箱授权码（不是QQ密码）
- 点击【Add secret】

> **如何获取QQ邮箱授权码？**
> 1. 登录QQ邮箱网页版
> 2. 设置 → 账户
> 3. 开启【POP3/SMTP服务】
> 4. 点击【生成授权码】
> 5. 按提示发送短信
> 6. 复制生成的授权码（16位字符）

#### 配置接收邮箱Secret

- **Name**: `RECEIVER_EMAIL`
- **Value**: 接收通知的邮箱地址（可以是任何邮箱）
- 点击【Add secret】

### 步骤3: 启用GitHub Actions

1. 点击【Actions】标签
2. 如果看到提示 "I understand my workflows, go ahead and enable them"，点击启用
3. 左侧菜单应该显示【Financial Web Monitor】工作流

### 步骤4: 测试运行

#### 手动触发测试

1. 进入【Actions】标签
2. 左侧选择【Financial Web Monitor】工作流
3. 点击右侧【Run workflow】
4. 点击【Run workflow】按钮确认
5. 等待执行完成（约30-60秒）

#### 查看执行日志

1. 点击刚才运行的工作流任务
2. 展开各个步骤查看详细日志
3. 确认所有步骤都成功执行

### 步骤5: 验证功能

#### 检查历史数据

1. 进入仓库主页
2. 应该能看到 `data/history.json` 文件被更新
3. 点击查看文件内容，确认数据已更新

#### 测试邮件通知

1. 首次运行会初始化历史数据，不会发送邮件
2. 可以在 `data/history.json` 中手动删除某个网站的数据
3. 再次运行工作流，应该会收到邮件通知

## 定时任务说明

系统默认配置为每天北京时间早上8:00自动运行。

如需修改时间，编辑 `.github/workflows/daily-monitor.yml`：

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 这是UTC时间
```

**常用cron表达式（UTC时间）：**

| 北京时间 | UTC时间 | Cron表达式 |
|---------|---------|-----------|
| 每天8:00 | 0:00 | `0 0 * * *` |
| 每天9:00 | 1:00 | `0 1 * * *` |
| 每天12:00 | 4:00 | `0 4 * * *` |
| 每天20:00 | 12:00 | `0 12 * * *` |
| 每2小时 | 每2小时 | `0 */2 * * *` |
| 工作日9:00 | 1:00 | `0 1 * * 1-5` |

修改后提交代码即可生效。

## 监控和维护

### 查看执行历史

1. 进入【Actions】标签
2. 点击【Financial Web Monitor】工作流
3. 可以看到所有执行记录和状态

### 查看日志

点击任意一次执行记录，可以查看：
- 执行开始/结束时间
- 各个步骤的执行时长
- 详细的输出日志
- 是否有错误发生

### 失败重试

如果某次执行失败，可以：
1. 查看错误日志定位问题
2. 修复问题后提交代码
3. 手动触发工作流验证

## 常见问题

### Q: 邮件发送失败怎么办？

A: 检查以下几点：
1. QQ邮箱授权码是否正确
2. QQ邮箱是否已开启SMTP服务
3. 接收邮箱地址是否正确
4. 查看Actions日志中的具体错误信息

### Q: 为什么收不到邮件？

A: 可能原因：
1. 首次运行只初始化数据，不发送邮件
2. 网站没有新内容更新
3. 邮件被接收邮箱的垃圾邮件过滤
4. 邮件配置错误，查看日志确认

### Q: 如何修改监控的网站？

A: 编辑 `src/config.js` 中的 `websites` 配置：

```javascript
websites: {
  szse: {
    name: '深圳证券交易所',
    url: 'http://www.szse.cn/lawrules/index.html',
    type: 'szse'
  },
  // 可以添加更多网站...
}
```

### Q: 如何增加更多网站监控？

A: 需要修改：
1. `src/config.js`: 添加网站配置
2. `src/parser.js`: 添加对应的解析逻辑
3. 其他模块通常无需修改

### Q: 定时任务没有执行？

A: 可能原因：
1. Actions未启用
2. 仓库是Private仓库且Actions配额用完
3. Cron表达式格式错误
4. GitHub服务暂时不可用

检查Actions页面确认工作流配置。

## 性能优化

### 减少不必要的邮件

如果发现更新很频繁，可以在 `src/index.js` 中添加过滤逻辑：

```javascript
// 只在工作日发送通知
if (new Date().getDay() === 0 || new Date().getDay() === 6) {
  console.log('周末跳过邮件通知');
  return;
}
```

### 调整重试策略

编辑 `src/config.js` 中的 `request` 配置：

```javascript
request: {
  timeout: 30000,        // 请求超时时间（毫秒）
  retries: 3,           // 重试次数
  retryDelay: 5000      // 重试延迟（毫秒）
}
```

### 限制历史数据条数

在 `src/storage.js` 中调整：

```javascript
const latestItems = mergedItems.slice(0, 100); // 限制100条
```

## 安全建议

1. **不要在代码中硬编码密码**: 使用GitHub Secrets管理敏感信息
2. **定期更新授权码**: 建议每3-6个月更换一次QQ邮箱授权码
3. **限制仓库访问权限**: 如果是私有仓库，谨慎添加协作者
4. **定期查看日志**: 监控异常访问或失败记录

## 备份与恢复

### 数据备份

由于历史数据存储在Git仓库中：
- 自动进行版本控制
- 可以随时回滚到历史版本
- 不需要额外的备份操作

### 恢复数据

如果需要恢复到某个历史版本：

```bash
# 查看历史提交
git log --oneline data/history.json

# 恢复到指定版本
git checkout <commit-hash> data/history.json

# 提交恢复
git add data/history.json
git commit -m "Restore history data"
git push
```

## 联系支持

如果遇到问题：
1. 查看README.md了解项目信息
2. 查看Actions日志定位错误
3. 在GitHub Issues提交问题

---

祝你部署顺利！
