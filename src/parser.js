const cheerio = require('cheerio');
const crypto = require('crypto');

class Parser {
  constructor() {
    this.baseUrl = '';
  }

  parseSZSE(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    this.baseUrl = 'http://www.szse.cn';
    
    $('.article-list a').each((index, element) => {
      const $a = $(element);
      const title = $a.text().trim();
      const href = $a.attr('href');
      
      if (title && href) {
        const fullUrl = this.resolveUrl(href);
        const item = {
          title: title,
          url: fullUrl,
          date: this.extractDateFromTitle(title),
          hash: this.generateHash(title + fullUrl)
        };
        items.push(item);
      }
    });
    
    console.log(`Parsed ${items.length} items from SZSE`);
    return items;
  }

  parseCSRC(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    this.baseUrl = 'http://www.csrc.gov.cn';
    
    $('table tbody tr').each((index, element) => {
      const $tr = $(element);
      const $titleCell = $tr.find('td').eq(1);
      const title = $titleCell.find('a').text().trim();
      const href = $titleCell.find('a').attr('href');
      const dateCell = $tr.find('td').eq(0);
      const dateText = dateCell.text().trim();
      
      if (title && href) {
        const fullUrl = this.resolveUrl(href);
        const item = {
          title: title,
          url: fullUrl,
          date: this.normalizeDate(dateText),
          hash: this.generateHash(title + fullUrl)
        };
        items.push(item);
      }
    });
    
    console.log(`Parsed ${items.length} items from CSRC`);
    return items;
  }

  parse(type, html) {
    switch(type) {
      case 'szse':
        return this.parseSZSE(html);
      case 'csrc':
        return this.parseCSRC(html);
      default:
        console.error(`Unknown type: ${type}`);
        return [];
    }
  }

  resolveUrl(href) {
    if (!href) return '';
    
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href;
    }
    
    if (href.startsWith('/')) {
      return this.baseUrl + href;
    }
    
    if (href.startsWith('./')) {
      return this.baseUrl + href.substring(1);
    }
    
    return href;
  }

  extractDateFromTitle(title) {
    const dateRegex = /(\d{4})[-年](\d{1,2})[-月](\d{1,2})/;
    const match = title.match(dateRegex);
    
    if (match) {
      const year = match[1];
      const month = match[2].padStart(2, '0');
      const day = match[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return new Date().toISOString().split('T')[0];
  }

  normalizeDate(dateText) {
    if (!dateText) return '';

    const dateMatch = dateText.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (dateMatch) {
      const year = dateMatch[1];
      const month = dateMatch[2].padStart(2, '0');
      const day = dateMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return dateText.trim();
  }

  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  generateContentHash(items) {
    const content = items.map(item => `${item.title}|${item.url}`).join('\n');
    return this.generateHash(content);
  }
}

module.exports = Parser;
