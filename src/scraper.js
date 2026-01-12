const axios = require('axios');
const config = require('./config');

class Scraper {
  constructor() {
    this.config = config.request;
  }

  async fetch(url) {
    let lastError;
    
    for (let i = 0; i < this.config.retries; i++) {
      try {
        const response = await axios.get(url, {
          timeout: this.config.timeout,
          headers: this.config.headers
        });
        
        return {
          success: true,
          data: response.data,
          status: response.status
        };
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${i + 1} failed for ${url}: ${error.message}`);
        
        if (i < this.config.retries - 1) {
          await this.sleep(this.config.retryDelay);
        }
      }
    }
    
    return {
      success: false,
      error: lastError.message,
      url: url
    };
  }

  async fetchAll() {
    const results = {};
    
    for (const [key, website] of Object.entries(config.websites)) {
      console.log(`Fetching ${website.name}...`);
      const result = await this.fetch(website.url);
      results[key] = result;
      
      if (!result.success) {
        console.error(`Failed to fetch ${website.name}: ${result.error}`);
      } else {
        console.log(`Successfully fetched ${website.name}`);
      }
    }
    
    return results;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Scraper;
