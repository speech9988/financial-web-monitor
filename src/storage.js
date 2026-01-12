const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

class Storage {
  constructor() {
    this.historyFile = path.resolve(config.storage.historyFile);
  }

  async loadHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return this.createEmptyHistory();
      }
      console.error('Error loading history:', error);
      return this.createEmptyHistory();
    }
  }

  async saveHistory(history) {
    try {
      const dir = path.dirname(this.historyFile);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2), 'utf-8');
      console.log('History saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving history:', error);
      return false;
    }
  }

  createEmptyHistory() {
    return {
      szse: {
        lastCheck: null,
        lastHash: null,
        items: []
      },
      csrc: {
        lastCheck: null,
        lastHash: null,
        items: []
      }
    };
  }

  async updateSiteHistory(siteType, data) {
    const history = await this.loadHistory();
    
    if (!history[siteType]) {
      history[siteType] = {
        lastCheck: null,
        lastHash: null,
        items: []
      };
    }
    
    history[siteType].lastCheck = new Date().toISOString();
    history[siteType].lastHash = data.hash;
    history[siteType].items = data.items;
    
    const success = await this.saveHistory(history);
    return success;
  }

  async getSiteHistory(siteType) {
    const history = await this.loadHistory();
    return history[siteType] || {
      lastCheck: null,
      lastHash: null,
      items: []
    };
  }

  async mergeNewItems(siteType, newItems) {
    const history = await this.loadHistory();
    const existingItems = history[siteType]?.items || [];
    
    const existingHashes = new Set(existingItems.map(item => item.hash));
    const trulyNewItems = newItems.filter(item => !existingHashes.has(item.hash));
    
    const mergedItems = [...trulyNewItems, ...existingItems];
    const latestItems = mergedItems.slice(0, 100);
    
    history[siteType] = {
      lastCheck: new Date().toISOString(),
      lastHash: null,
      items: latestItems
    };
    
    return trulyNewItems;
  }
}

module.exports = Storage;
