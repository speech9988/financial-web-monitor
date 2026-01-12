# Financial Web Monitor - Agent Guidelines

## Build & Test Commands

- `npm start` - Run the main monitoring application
- `npm test` - Run full test suite (includes environment and dependency checks)
- No individual test command available - tests are in test.js and run end-to-end

## Project Architecture

This is a financial regulation monitoring system that scrapes regulatory updates from multiple financial websites and sends email notifications when changes are detected.

**Core Components:**
- `src/index.js` - Main Monitor class orchestrating the workflow
- `src/scraper.js` - HTTP request handling with retry logic
- `src/parser.js` - HTML parsing for different website types
- `src/comparator.js` - Change detection and history management
- `src/notifier.js` - Email notification system
- `src/config.js` - Centralized configuration

**Data Storage:**
- `data/history.json` - Stores last check timestamps, content hashes, and parsed items

## Code Style Guidelines

### Import/Export
- Use CommonJS: `require()` and `module.exports`
- Module imports at top of file, separated from other code
- Class definitions use constructor pattern

### Formatting & Types
- 2-space indentation
- CamelCase for variables and functions
- PascalCase for classes
- Comments in Chinese (用户界面用中文提示)
- No type annotations - plain JavaScript

### Naming Conventions
- Classes: PascalCase (e.g., `Scraper`, `Parser`)
- Functions/Methods: camelCase (e.g., `fetchAll`, `parseSZSE`)
- Variables: camelCase (e.g., `fetchResults`, `compareResults`)
- Constants: UPPER_SNAKE_CASE in config (e.g., `TIMEOUT`, `RETRIES`)
- File names: lowercase with kebab-case (e.g., `scraper.js`, `comparator.js`)

### Error Handling
- Use try-catch for async operations
- Log errors with `console.error()`
- Return error objects with `success: false` flag
- Include helpful error messages in Chinese
- Process.exit(1) for critical failures in test.js

### Adding New Website Support

To add a new website to monitor:

1. **Update `src/config.js`**: Add website entry to `websites` object with `name`, `url`, and `type` properties
2. **Update `src/parser.js`**: Add new parse method (e.g., `parseSinaStock`) that returns array of items with `{title, url, date, hash}`
3. **Update `src/parser.js`**: Add case in `parse()` method switch statement for new type
4. **Update `test.js`**: Add initial data structure in history file initialization section
5. Follow existing patterns: use cheerio for parsing, `generateHash()` for deduplication, `resolveUrl()` for link handling

### Parser Implementation Pattern

Each parser method should:
- Set `this.baseUrl` to website domain
- Use cheerio selectors to extract items
- Extract: title, url, date
- Call `resolveUrl()` to fix relative URLs
- Call `generateHash()` with title+url for uniqueness
- Return array of item objects
- Log parsed item count

### Configuration

Environment variables required (in .env or system env):
- `QQ_EMAIL` - Sender QQ email address
- `QQ_AUTH_CODE` - QQ email SMTP authorization code
- `RECEIVER_EMAIL` - Target email for notifications

HTTP requests:
- Timeout: 30000ms
- Retries: 3 with 5000ms delay
- User-Agent: Chrome 120 string
