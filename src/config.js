module.exports = {
  websites: {
    szse: {
      name: '深圳证券交易所',
      url: 'http://www.szse.cn/lawrules/index.html',
      type: 'szse'
    },
    csrc: {
      name: '中国证监会',
      url: 'http://www.csrc.gov.cn/csrc/c101953/zfxxgk_zdgk.shtml',
      type: 'csrc'
    },
    sinastock: {
      name: '新浪股票',
      url: 'https://finance.sina.com.cn/roll/',
      type: 'sinastock'
    }
  },

  email: {
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    from: process.env.QQ_EMAIL,
    to: process.env.RECEIVER_EMAIL,
    auth: {
      user: process.env.QQ_EMAIL,
      pass: process.env.QQ_AUTH_CODE
    }
  },

  request: {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    retries: 3,
    retryDelay: 5000
  },

  storage: {
    historyFile: './data/history.json'
  }
};
