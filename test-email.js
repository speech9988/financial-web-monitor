require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.QQ_EMAIL,
      pass: process.env.QQ_AUTH_CODE
    }
  });

  const mailOptions = {
    from: process.env.QQ_EMAIL,
    to: process.env.RECEIVER_EMAIL,
    subject: '金融法规监控 - 邮件测试',
    text: '这是一封测试邮件，用于验证邮件配置是否正确。\n\n如果您收到此邮件，说明配置成功！'
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('测试邮件发送成功！');
    process.exit(0);
  } catch (error) {
    console.error('邮件发送失败:', error.message);
    process.exit(1);
  }
}

testEmail();
