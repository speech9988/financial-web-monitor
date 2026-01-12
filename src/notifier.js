const nodemailer = require('nodemailer');
const config = require('./config');

class Notifier {
  constructor() {
    this.transporter = null;
    this.emailConfig = config.email;
  }

  async init() {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.emailConfig.host,
        port: this.emailConfig.port,
        secure: this.emailConfig.secure,
        auth: {
          user: this.emailConfig.auth.user,
          pass: this.emailConfig.auth.pass
        }
      });
      
      console.log('Email transporter initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      return false;
    }
  }

  async sendNotification(summary) {
    if (!this.transporter) {
      await this.init();
    }
    
    if (!summary.sitesWithChanges) {
      console.log('No changes detected, skipping email notification');
      return false;
    }
    
    const subject = this.generateSubject(summary);
    const html = this.generateHtml(summary);
    const text = this.generateText(summary);
    
    try {
      const info = await this.transporter.sendMail({
        from: this.emailConfig.from,
        to: this.emailConfig.to,
        subject: subject,
        text: text,
        html: html
      });
      
      console.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  generateSubject(summary) {
    const count = summary.totalNewItems;
    const sites = summary.details.map(d => this.getSiteName(d.siteType)).join('、');
    return `【金融法规更新】发现${count}条新规则 - ${sites}`;
  }

  generateHtml(summary) {
    const timestamp = new Date().toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: "Microsoft YaHei", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .summary {
      background: #f7fafc;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .site-section {
      margin-bottom: 30px;
    }
    .site-title {
      color: #667eea;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .item-list {
      list-style: none;
      padding: 0;
    }
    .item {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 10px;
      transition: box-shadow 0.3s;
    }
    .item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .item-title {
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 8px;
      font-size: 16px;
    }
    .item-meta {
      color: #718096;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .item-link {
      display: inline-block;
      padding: 6px 12px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
    }
    .item-link:hover {
      background: #5a67d8;
    }
    .footer {
      text-align: center;
      color: #718096;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 金融法规更新通知</h1>
    <p>检测时间：${timestamp}</p>
  </div>
  
  <div class="summary">
    <h3>📋 汇总信息</h3>
    <p>本次监控发现 <strong>${summary.totalNewItems}</strong> 条新规则/政策</p>
    <p>涉及网站：${summary.details.map(d => this.getSiteName(d.siteType)).join('、')}</p>
  </div>
`;

    for (const detail of summary.details) {
      html += `
  <div class="site-section">
    <div class="site-title">${this.getSiteName(detail.siteType)}</div>
    <ul class="item-list">
`;
      
      for (const item of detail.newItems) {
        html += `
      <li class="item">
        <div class="item-title">${this.escapeHtml(item.title)}</div>
        <div class="item-meta">📅 发布日期：${item.date}</div>
        <a href="${item.url}" class="item-link" target="_blank">查看详情</a>
      </li>
`;
      }
      
      html += `
    </ul>
  </div>
`;
    }

    html += `
  <div class="footer">
    <p>此邮件由金融法规监控系统自动发送</p>
    <p>如需取消订阅，请联系系统管理员</p>
  </div>
</body>
</html>
`;
    
    return html;
  }

  generateText(summary) {
    let text = `金融法规更新通知\n`;
    text += `检测时间：${new Date().toLocaleString('zh-CN')}\n\n`;
    text += `本次监控发现 ${summary.totalNewItems} 条新规则/政策\n`;
    text += `涉及网站：${summary.details.map(d => this.getSiteName(d.siteType)).join('、')}\n\n`;
    
    for (const detail of summary.details) {
      text += `【${this.getSiteName(detail.siteType)}】\n`;
      for (const item of detail.newItems) {
        text += `- ${item.title}\n`;
        text += `  日期：${item.date}\n`;
        text += `  链接：${item.url}\n\n`;
      }
    }
    
    return text;
  }

  getSiteName(siteType) {
    const names = {
      szse: '深圳证券交易所',
      csrc: '中国证监会',
      sinastock: '新浪股票'
    };
    return names[siteType] || siteType;
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = Notifier;
