const Scraper = require('./scraper');
const Parser = require('./parser');
const Comparator = require('./comparator');
const Notifier = require('./notifier');
const config = require('./config');

class Monitor {
  constructor() {
    this.scraper = new Scraper();
    this.parser = new Parser();
    this.comparator = new Comparator();
    this.notifier = new Notifier();
  }

  async run() {
    console.log('='.repeat(50));
    console.log('开始金融法规监控任务');
    console.log('='.repeat(50));
    
    try {
      const startTime = Date.now();
      
      const fetchResults = await this.scraper.fetchAll();
      const parseResults = {};
      const compareResults = {};
      
      for (const [key, fetchResult] of Object.entries(fetchResults)) {
        if (fetchResult.success) {
          const website = config.websites[key];
          console.log(`\n处理 ${website.name}...`);
          
          const items = this.parser.parse(website.type, fetchResult.data);
          parseResults[key] = items;
          
          const comparison = await this.comparator.compare(website.type, items);
          compareResults[key] = comparison;
          
          await this.comparator.updateHistory(website.type, items);
        } else {
          console.error(`跳过 ${key}，获取失败`);
          compareResults[key] = {
            siteType: key,
            hasChanges: false,
            error: fetchResult.error
          };
        }
      }
      
      const summary = this.comparator.getSummary(compareResults);
      await this.sendSummary(summary);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('='.repeat(50));
      console.log(`监控任务完成，耗时 ${duration} 秒`);
      console.log('='.repeat(50));
      
      return summary;
      
    } catch (error) {
      console.error('监控任务执行失败:', error);
      throw error;
    }
  }

  async sendSummary(summary) {
    console.log('\n生成监控摘要...');
    console.log(`总网站数: ${summary.totalSites}`);
    console.log(`有变化的网站: ${summary.sitesWithChanges}`);
    console.log(`新规则数: ${summary.totalNewItems}`);
    
    if (summary.sitesWithChanges > 0) {
      console.log('\n发送邮件通知...');
      const sent = await this.notifier.sendNotification(summary);
      if (sent) {
        console.log('邮件通知发送成功');
      } else {
        console.error('邮件通知发送失败');
      }
    } else {
      console.log('\n没有检测到更新，不发送邮件');
    }
  }
}

async function main() {
  const monitor = new Monitor();
  
  try {
    await monitor.run();
    process.exit(0);
  } catch (error) {
    console.error('程序执行失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = Monitor;
