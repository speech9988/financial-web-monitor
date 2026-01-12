# 金融法规监控系统

自动监控深交所和证监会官网的法规更新，发现新规则时通过邮件通知。

## 功能特性

- 自动监控深圳证券交易所和中国证监会官网
- 智能检测法规/政策更新
- 发现更新时发送精美邮件通知
- 基于GitHub Actions自动运行
- 完整的历史记录追踪
- 支持手动触发检查

## 技术栈

- **运行环境**: GitHub Actions (Serverless)
- **开发语言**: Node.js
- **网页抓取**: Axios + Cheerio
- **邮件服务**: Nodemailer + QQ邮箱SMTP
- **定时任务**: GitHub Actions Cron

## 项目结构

```
financial-web-monitor/
├── src/
│   ├── config.js          # 配置文件
│   ├── scraper.js         # 网页抓取模块
│   ├── parser.js          # 内容解析模块
│   ├── storage.js         # 数据存储模块
│   ├── comparator.js      # 内容对比模块
│   ├── notifier.js        # 邮件通知模块
│   └── index.js           # 主入口文件
├── data/
│   └── history.json       # 历史数据存储
├── .github/
│   └── workflows/
│       └── daily-monitor.yml    # GitHub Actions配置
├── package.json
├── .env.example
└── README.md
```

## 快速开始

### 1. 获取QQ邮箱授权码

1. 登录QQ邮箱网页版 (https://mail.qq.com)
2. 进入【设置】→【账户】
3. 找到【POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务】
4. 开启【POP3/SMTP服务】
5. 点击【生成授权码】
6. 按提示发送短信获取授权码（请妥善保存，不是QQ密码）

### 2. 部署到GitHub

#### Fork 本仓库

点击页面右上角的"Fork"按钮，将此仓库复制到你的GitHub账户。

#### 配置 Secrets

进入你Fork的仓库，依次操作：
1. 点击【Settings】
2. 左侧菜单选择【Secrets and variables】→【Actions】
3. 点击【New repository secret】
4. 添加以下三个Secret：

| Secret名称 | 说明 | 示例 |
|------------|------|------|
| `QQ_EMAIL` | 发送邮件的QQ邮箱 | your@qq.com |
| `QQ_AUTH_CODE` | QQ邮箱授权码 | xxxxxxxx |
| `RECEIVER_EMAIL` | 接收通知的邮箱 | target@example.com |

#### 启用 Actions

1. 点击【Actions】标签
2. 点击【I understand my workflows, go ahead and enable them】启用工作流

### 3. 测试运行

1. 进入【Actions】标签
2. 左侧选择【Financial Web Monitor】工作流
3. 点击右侧【Run workflow】→【Run workflow】手动触发测试
4. 查看执行日志，确认正常运行

## 本地运行

如需在本地运行：

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env`，并填写实际值：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
QQ_EMAIL=your@qq.com
QQ_AUTH_CODE=your_qq_email_auth_code
RECEIVER_EMAIL=target@example.com
```

### 运行程序

```bash
npm start
```

## 定时任务

系统默认配置为每天北京时间早上8:00自动运行一次。

如需修改时间，编辑 `.github/workflows/daily-monitor.yml` 文件中的 cron 表达式：

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # UTC时间，北京时间+8
```

更多 cron 表达式参考：https://crontab.guru/

## 监控网站

目前支持以下网站的监控：

1. **深圳证券交易所** (SZSE)
   - 网址：http://www.szse.cn/lawrules/index.html
   - 监控内容：最新法律规则更新

2. **中国证监会** (CSRC)
   - 网址：http://www.csrc.gov.cn/csrc/c101953/zfxxgk_zdgk.shtml
   - 监控内容：政府信息公开-主动公开

3. 新浪
## 工作原理

```
GitHub Actions定时触发
  ↓
抓取网页内容
  ↓
解析HTML提取规则列表
  ↓
与历史数据对比
  ↓
发现新规则 → 发送邮件通知
  ↓
更新历史记录
```

## 邮件通知示例

当发现新规则时，你会收到类似以下的邮件：

- **主题**: 【金融法规更新】发现2条新规则 - 深圳证券交易所
- **内容**: 包含新规则的标题、发布日期、查看链接等详细信息

邮件采用HTML格式，排版美观，方便快速浏览。

## 数据存储

历史数据存储在仓库的 `data/history.json` 文件中，包含：

- 各网站的上次检查时间
- 各网站的内容哈希值
- 最近100条规则的详细信息

每次运行后，GitHub Actions会自动提交更新到仓库。

## 故障排查

### 邮件发送失败

- 检查QQ邮箱授权码是否正确
- 确认QQ邮箱已开启SMTP服务
- 查看GitHub Actions执行日志中的错误信息

### 网页抓取失败

- 检查目标网站是否可访问
- 查看GitHub Actions执行日志中的错误信息
- 可能是网络问题或网站结构发生变化

### 找不到更新

- 首次运行会初始化历史记录，不会发送邮件
- 后续运行才会对比发现更新
- 确认网站确实有新规则发布

## 注意事项

1. **隐私保护**: 邮箱授权码等敏感信息使用GitHub Secrets存储，不会暴露在代码中
2. **访问频率**: 系统每天仅检查一次，避免频繁请求影响网站
3. **遵守规则**: 程序仅供个人学习使用，请遵守目标网站的使用条款
4. **数据备份**: 历史数据存储在Git仓库中，自动进行版本控制
5. **时区处理**: 定时任务使用UTC时间，注意与北京时间的转换

## 扩展功能

可以根据需要扩展以下功能：

- 支持更多网站的监控
- 添加关键词过滤
- 支持多种通知方式（微信、钉钉等）
- 添加Web管理界面
- 支持RSS输出
- 自定义邮件模板

## 许可证

ISC License

## 问题反馈

如有问题或建议，请提交Issue。
