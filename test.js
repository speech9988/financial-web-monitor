const Monitor = require('./src/index');
const fs = require('fs');

async function test() {
  console.log('='.repeat(50));
  console.log('金融法规监控系统 - 测试运行');
  console.log('='.repeat(50));
  console.log('');
  
  console.log('检查环境配置...');
  
  const requiredEnvVars = ['QQ_EMAIL', 'QQ_AUTH_CODE', 'RECEIVER_EMAIL'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ 缺少以下环境变量:');
    missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('');
    console.error('请创建 .env 文件并配置以下变量:');
    console.error('QQ_EMAIL=your@qq.com');
    console.error('QQ_AUTH_CODE=your_qq_email_auth_code');
    console.error('RECEIVER_EMAIL=target@example.com');
    process.exit(1);
  }
  
  console.log('✅ 环境变量配置正确');
  console.log('');
  
  console.log('检查依赖包...');
  try {
    require('axios');
    require('cheerio');
    require('nodemailer');
    console.log('✅ 所有依赖包已安装');
  } catch (error) {
    console.error('❌ 缺少依赖包，请运行: npm install');
    process.exit(1);
  }
  console.log('');
  
  console.log('检查数据目录...');
  try {
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data', { recursive: true });
      console.log('✅ 数据目录已创建');
    } else {
      console.log('✅ 数据目录已存在');
    }
  } catch (error) {
    console.error('❌ 无法创建数据目录:', error.message);
    process.exit(1);
  }
  console.log('');
  
  console.log('检查历史数据文件...');
  try {
    if (!fs.existsSync('./data/history.json')) {
      const initialData = {
        szse: {
          lastCheck: null,
          lastHash: null,
          items: []
        },
        csrc: {
          lastCheck: null,
          lastHash: null,
          items: []
        },
        sinastock: {
          lastCheck: null,
          lastHash: null,
          items: []
        }
      };
      fs.writeFileSync('./data/history.json', JSON.stringify(initialData, null, 2));
      console.log('✅ 历史数据文件已创建');
    } else {
      console.log('✅ 历史数据文件已存在');
    }
  } catch (error) {
    console.error('❌ 无法创建历史数据文件:', error.message);
    process.exit(1);
  }
  console.log('');
  
  console.log('='.repeat(50));
  console.log('开始测试运行...');
  console.log('='.repeat(50));
  console.log('');
  
  const monitor = new Monitor();
  
  try {
    const result = await monitor.run();
    
    console.log('');
    console.log('='.repeat(50));
    console.log('测试完成！');
    console.log('='.repeat(50));
    console.log('');
    console.log('📊 运行摘要:');
    console.log(`   - 监控网站数: ${result.totalSites}`);
    console.log(`   - 有变化的网站: ${result.sitesWithChanges}`);
    console.log(`   - 新规则数: ${result.totalNewItems}`);
    console.log('');
    
    if (result.sitesWithChanges > 0) {
      console.log('✅ 已发送邮件通知');
    } else {
      console.log('ℹ️  没有检测到新规则，未发送邮件');
      console.log('   这是正常的。首次运行会初始化历史数据。');
      console.log('   下次运行时才会检测更新并发送邮件。');
    }
    
    console.log('');
    console.log('✅ 所有测试通过！');
    console.log('');
    console.log('提示: 查看 data/history.json 了解抓取到的数据');
    
  } catch (error) {
    console.error('');
    console.error('❌ 测试运行失败:', error.message);
    console.error('');
    console.error('请检查:');
    console.error('1. 网络连接是否正常');
    console.error('2. 目标网站是否可访问');
    console.error('3. QQ邮箱配置是否正确');
    console.error('4. 查看上面的错误详情');
    process.exit(1);
  }
}

if (require.main === module) {
  test();
}

module.exports = test;
