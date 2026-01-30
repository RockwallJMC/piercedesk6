/**
 * Name Convention Plugin
 * Fixes naming convention violations
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('../lib/file-utils');
const BasePlugin = require('./base-plugin');
const { SYSTEM_PREFIXES } = require('../lib/keywords');

class NameConventionPlugin extends BasePlugin {
  constructor(config = {}) {
    super(config);
    this.docsRoot = config.docsRoot || 'docs';
    this.dryRun = config.dryRun || false;
  }

  /**
   * Scan for naming violations
   */
  async scan() {
    console.log(`\n[${this.name}] Scanning for naming convention violations...`);

    // Check system docs
    await this.checkSystemDocs();

    // Check user docs
    await this.checkUserDocs();

    console.log(`[${this.name}] Found ${this.findings.length} naming violations`);
    return this.findings;
  }

  /**
   * Check system docs naming conventions
   */
  async checkSystemDocs() {
    const systemDirs = [
      'docs/system/design',
      'docs/system/execution',
      'docs/system/as-builts',
      'docs/system/plans',
      'docs/system/vision',
      'docs/system/roadmap'
    ];

    for (const dir of systemDirs) {
      const pattern = path.join(process.cwd(), dir, '*.md');
      const files = await glob(pattern, {
        ignore: ['**/README.md', '**/AGENT.md']
      });

      const expectedPrefix = this.getSystemPrefix(dir);

      for (const file of files) {
        const filename = path.basename(file);
        const violation = this.checkSystemFilename(filename, expectedPrefix);

        if (violation) {
          const corrected = this.correctSystemFilename(filename, expectedPrefix);
          this.logFinding({
            type: 'naming_violation',
            category: 'system',
            file,
            currentName: filename,
            correctName: corrected,
            reason: violation,
            expectedPrefix
          });
          console.log(`  - ${filename} → ${corrected} (${violation})`);
        }
      }
    }

    // Check INDEX files in system root
    const indexPattern = path.join(process.cwd(), 'docs/system', 'INDEX-*.md');
    const indexFiles = await glob(indexPattern);

    for (const file of indexFiles) {
      const filename = path.basename(file);
      if (!filename.startsWith('INDEX-')) {
        continue; // Should not happen with glob pattern
      }

      const violation = this.checkSystemFilename(filename, null);
      if (violation) {
        const corrected = this.correctSystemFilename(filename, null);
        this.logFinding({
          type: 'naming_violation',
          category: 'system',
          file,
          currentName: filename,
          correctName: corrected,
          reason: violation,
          expectedPrefix: 'INDEX-'
        });
        console.log(`  - ${filename} → ${corrected} (${violation})`);
      }
    }
  }

  /**
   * Get expected prefix for system directory
   */
  getSystemPrefix(dir) {
    const prefixMap = {
      'docs/system/design': 'design-',
      'docs/system/execution': 'execution-',
      'docs/system/as-builts': 'as-built-',
      'docs/system/plans': 'plan-',
      'docs/system/vision': 'vision-',
      'docs/system/roadmap': 'roadmap-'
    };
    return prefixMap[dir] || null;
  }

  /**
   * Check system filename for violations
   */
  checkSystemFilename(filename, expectedPrefix) {
    // Check for uppercase letters
    if (filename !== filename.toLowerCase()) {
      return 'Contains uppercase letters';
    }

    // Check for spaces
    if (filename.includes(' ')) {
      return 'Contains spaces';
    }

    // Check for underscores (except in INDEX files)
    if (!filename.startsWith('INDEX-') && filename.includes('_')) {
      return 'Contains underscores (use dashes)';
    }

    // Check for expected prefix (if applicable)
    if (expectedPrefix && !filename.startsWith(expectedPrefix)) {
      return `Missing prefix '${expectedPrefix}'`;
    }

    return null;
  }

  /**
   * Correct system filename
   */
  correctSystemFilename(filename, expectedPrefix) {
    let corrected = filename;

    // Convert to lowercase
    corrected = corrected.toLowerCase();

    // Replace spaces with dashes
    corrected = corrected.replace(/\s+/g, '-');

    // Replace underscores with dashes (except in INDEX files)
    if (!corrected.startsWith('index-')) {
      corrected = corrected.replace(/_/g, '-');
    }

    // Add prefix if missing and expected
    if (expectedPrefix && !corrected.startsWith(expectedPrefix)) {
      // Remove any existing system prefix first
      for (const prefix of SYSTEM_PREFIXES) {
        if (corrected.startsWith(prefix.toLowerCase())) {
          corrected = corrected.slice(prefix.length);
          break;
        }
      }
      corrected = expectedPrefix + corrected;
    }

    // Remove multiple consecutive dashes
    corrected = corrected.replace(/-+/g, '-');

    return corrected;
  }

  /**
   * Check user docs naming conventions
   */
  async checkUserDocs() {
    const userDirs = [
      'docs/user-docs/features',
      'docs/user-docs/guides',
      'docs/user-docs/api'
    ];

    for (const dir of userDirs) {
      const pattern = path.join(process.cwd(), dir, '*.md');
      const files = await glob(pattern, {
        ignore: ['**/README.md', '**/AGENT.md']
      });

      for (const file of files) {
        const filename = path.basename(file);
        const violation = this.checkUserFilename(filename);

        if (violation) {
          const corrected = this.correctUserFilename(filename);
          this.logFinding({
            type: 'naming_violation',
            category: 'user',
            file,
            currentName: filename,
            correctName: corrected,
            reason: violation
          });
          console.log(`  - ${filename} → ${corrected} (${violation})`);
        }
      }
    }
  }

  /**
   * Check user filename for violations
   */
  checkUserFilename(filename) {
    // Check for uppercase letters
    if (filename !== filename.toLowerCase()) {
      return 'Contains uppercase letters';
    }

    // Check for spaces
    if (filename.includes(' ')) {
      return 'Contains spaces';
    }

    // Check for underscores
    if (filename.includes('_')) {
      return 'Contains underscores (use dashes)';
    }

    // Check for technical prefixes
    for (const prefix of SYSTEM_PREFIXES) {
      if (filename.startsWith(prefix.toLowerCase())) {
        return `Has technical prefix '${prefix}' (should be user-friendly)`;
      }
    }

    return null;
  }

  /**
   * Correct user filename
   */
  correctUserFilename(filename) {
    let corrected = filename;

    // Convert to lowercase
    corrected = corrected.toLowerCase();

    // Replace spaces with dashes
    corrected = corrected.replace(/\s+/g, '-');

    // Replace underscores with dashes
    corrected = corrected.replace(/_/g, '-');

    // Remove technical prefixes
    for (const prefix of SYSTEM_PREFIXES) {
      if (corrected.startsWith(prefix.toLowerCase())) {
        corrected = corrected.slice(prefix.length);
        break;
      }
    }

    // Remove multiple consecutive dashes
    corrected = corrected.replace(/-+/g, '-');

    // Remove leading dash if present
    corrected = corrected.replace(/^-+/, '');

    return corrected;
  }

  /**
   * Rename files
   */
  async fix() {
    console.log(`\n[${this.name}] Renaming files...`);

    for (const finding of this.findings) {
      try {
        const { file, correctName } = finding;
        const dir = path.dirname(file);
        const newPath = path.join(dir, correctName);

        // Check if target file already exists
        try {
          await fs.access(newPath);
          console.log(`  ⚠ Target exists, skipping: ${correctName}`);
          continue;
        } catch (err) {
          // File doesn't exist, proceed
        }

        if (this.dryRun) {
          console.log(`  [DRY RUN] Would rename:`);
          console.log(`    ${path.relative(process.cwd(), file)}`);
          console.log(`    → ${path.relative(process.cwd(), newPath)}`);
        } else {
          await fs.rename(file, newPath);
          console.log(`  ✓ Renamed:`);
          console.log(`    ${path.relative(process.cwd(), file)}`);
          console.log(`    → ${path.relative(process.cwd(), newPath)}`);
        }

        this.logChange({
          type: 'file_renamed',
          from: file,
          to: newPath,
          oldName: finding.currentName,
          newName: correctName,
          reason: finding.reason
        });
      } catch (err) {
        console.error(`  ✗ Error renaming ${finding.file}:`, err.message);
      }
    }

    return this.changes;
  }

  /**
   * Generate report section
   */
  async report() {
    if (this.changes.length === 0) {
      return '';
    }

    let report = '### 🔧 Files Renamed\n\n';
    report += '| Old Name | New Name | Reason |\n';
    report += '|----------|----------|--------|\n';

    for (const change of this.changes) {
      report += `| \`${change.oldName}\` | \`${change.newName}\` | ${change.reason} |\n`;
    }

    report += `\n**Total renamed**: ${this.changes.length} files\n\n`;

    return report;
  }
}

module.exports = NameConventionPlugin;
