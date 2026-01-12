const crypto = require('crypto');
const Storage = require('./storage');

class Comparator {
  constructor() {
    this.storage = new Storage();
  }

  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  generateItemsHash(items) {
    const content = items.map(item => `${item.title}|${item.url}`).sort().join('\n');
    return this.generateHash(content);
  }

  async compare(siteType, currentItems) {
    const history = await this.storage.getSiteHistory(siteType);
    const previousHash = history.lastHash;
    const previousItems = history.items || [];
    
    const currentHash = this.generateItemsHash(currentItems);
    
    const result = {
      siteType: siteType,
      hasChanges: false,
      previousHash: previousHash,
      currentHash: currentHash,
      newItems: [],
      changedItems: []
    };
    
    if (previousHash) {
      result.hasChanges = previousHash !== currentHash;
      
      if (result.hasChanges) {
        result.newItems = this.findNewItems(currentItems, previousItems);
        result.changedItems = this.findChangedItems(currentItems, previousItems);
        console.log(`Found ${result.newItems.length} new items and ${result.changedItems.length} changed items for ${siteType}`);
      }
    } else {
      result.hasChanges = currentItems.length > 0;
      result.newItems = currentItems.slice(0, 10);
      console.log(`First run for ${siteType}, tracking ${result.newItems.length} initial items`);
    }
    
    return result;
  }

  findNewItems(currentItems, previousItems) {
    const previousHashes = new Set(previousItems.map(item => item.hash));
    return currentItems.filter(item => !previousHashes.has(item.hash));
  }

  findChangedItems(currentItems, previousItems) {
    const previousMap = new Map(previousItems.map(item => [item.hash, item]));
    const changed = [];
    
    for (const currentItem of currentItems) {
      const previousItem = previousMap.get(currentItem.hash);
      if (previousItem && previousItem.title !== currentItem.title) {
        changed.push({
          current: currentItem,
          previous: previousItem
        });
      }
    }
    
    return changed;
  }

  async updateHistory(siteType, items) {
    const hash = this.generateItemsHash(items);
    const data = {
      hash: hash,
      items: items
    };
    
    return await this.storage.updateSiteHistory(siteType, data);
  }

  getSummary(results) {
    const summary = {
      totalSites: 0,
      sitesWithChanges: 0,
      totalNewItems: 0,
      totalChangedItems: 0,
      details: []
    };
    
    for (const [siteType, result] of Object.entries(results)) {
      summary.totalSites++;
      
      if (result.hasChanges) {
        summary.sitesWithChanges++;
        summary.totalNewItems += result.newItems.length;
        summary.totalChangedItems += result.changedItems.length;
        
        summary.details.push({
          siteType: siteType,
          newItemsCount: result.newItems.length,
          changedItemsCount: result.changedItems.length,
          newItems: result.newItems
        });
      }
    }
    
    return summary;
  }
}

module.exports = Comparator;
