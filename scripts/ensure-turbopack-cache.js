const fs = require('fs');
const path = require('path');

const cacheDir = process.env.TURBOPACK_CACHE_DIR || path.join('.next', 'cache', 'turbopack');
const dbDir = path.join(cacheDir, 'turbo-tasks', 'db');

try {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`[ensure-turbopack-cache] ensured ${dbDir}`);
} catch (err) {
  console.error('[ensure-turbopack-cache] failed', err && err.message ? err.message : err);
  process.exit(1);
}
