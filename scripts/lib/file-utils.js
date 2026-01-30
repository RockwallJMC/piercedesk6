/**
 * File utilities - replaces glob package with native Node.js fs
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Find files matching pattern (simple glob replacement)
 * @param {string} pattern - Pattern like "src/**\/*.md"
 * @param {Object} options - Options like { ignore: ['pattern'] }
 * @returns {Promise<string[]>} Array of file paths
 */
async function glob(pattern, options = {}) {
  const ignore = options.ignore || [];

  // Parse pattern
  const parts = pattern.split('/');
  const basePath = parts.filter(p => !p.includes('*')).join('/');
  const extension = pattern.match(/\*\.(\w+)$/)?.[1];

  // Find all files recursively
  const files = await findFilesRecursive(basePath || '.', extension);

  // Filter by ignore patterns
  return files.filter(file => {
    return !ignore.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(file);
    });
  });
}

/**
 * Find files recursively
 */
async function findFilesRecursive(dir, extension = null) {
  const results = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subResults = await findFilesRecursive(fullPath, extension);
        results.push(...subResults);
      } else if (entry.isFile()) {
        if (!extension || fullPath.endsWith(`.${extension}`)) {
          results.push(path.resolve(fullPath));
        }
      }
    }
  } catch (err) {
    // Directory doesn't exist or no permission
  }

  return results;
}

module.exports = { glob };
