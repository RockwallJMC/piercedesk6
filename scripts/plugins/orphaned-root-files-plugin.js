/**
 * Orphaned Root Files Plugin
 * Finds and moves .md files from repository root
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('../lib/file-utils');
const BasePlugin = require('./base-plugin');
const Categorizer = require('../lib/categorizer');

class OrphanedRootFilesPlugin extends BasePlugin {
  constructor(config = {}) {
    super(config);
    this.dryRun = config.dryRun || false;

    // Files that are allowed to stay in root
    this.allowedFiles = [
      'README.md',
      'CLAUDE.md',
      'LICENSE.md',
      'CHANGELOG.md',
      'CONTRIBUTING.md',
      'CODE_OF_CONDUCT.md',
      'SECURITY.md'
    ];
  }

  /**
   * Scan for orphaned files in root
   */
  async scan() {
    console.log(`\n[${this.name}] Scanning root directory for orphaned .md files...`);

    // Find all .md files in root (not recursive)
    const pattern = path.join(process.cwd(), '*.md');
    const files = await glob(pattern);

    for (const file of files) {
      const filename = path.basename(file);

      // Skip allowed files
      if (this.allowedFiles.includes(filename)) {
        continue;
      }

      try {
        const category = await Categorizer.categorize(file);

        this.logFinding({
          type: 'orphaned_root_file',
          file,
          filename,
          category: category.target,
          confidence: category.confidence,
          reason: category.reason,
          method: category.method
        });

        console.log(`  - ${filename}`);
        console.log(`    → ${category.target} (${category.confidence})`);
      } catch (err) {
        console.error(`  ✗ Error categorizing ${file}:`, err.message);
      }
    }

    console.log(`[${this.name}] Found ${this.findings.length} orphaned files`);
    return this.findings;
  }

  /**
   * Move files to target locations
   */
  async fix() {
    console.log(`\n[${this.name}] Moving orphaned files...`);

    for (const finding of this.findings) {
      try {
        const { file, filename, category } = finding;
        const targetDir = path.join(process.cwd(), category);
        const targetPath = path.join(targetDir, filename);

        // Check if target file already exists
        let finalTargetPath = targetPath;
        try {
          await fs.access(targetPath);
          // File exists, append timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          const ext = path.extname(filename);
          const base = path.basename(filename, ext);
          finalTargetPath = path.join(targetDir, `${base}-${timestamp}${ext}`);
          console.log(`  ⚠ File exists, using: ${path.basename(finalTargetPath)}`);
        } catch (err) {
          // File doesn't exist, use original target
        }

        if (this.dryRun) {
          console.log(`  [DRY RUN] Would move:`);
          console.log(`    ${filename}`);
          console.log(`    → ${path.relative(process.cwd(), finalTargetPath)}`);
        } else {
          // Create target directory
          await fs.mkdir(targetDir, { recursive: true });

          // Move file
          await fs.rename(file, finalTargetPath);

          console.log(`  ✓ Moved:`);
          console.log(`    ${filename}`);
          console.log(`    → ${path.relative(process.cwd(), finalTargetPath)}`);
        }

        this.logChange({
          type: 'file_moved',
          from: file,
          to: finalTargetPath,
          category: category,
          confidence: finding.confidence
        });
      } catch (err) {
        console.error(`  ✗ Error moving ${finding.file}:`, err.message);
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

    let report = '### 🧹 Orphaned Root Files Cleaned\n\n';
    report += '| Original Name | New Location | Category | Confidence |\n';
    report += '|--------------|--------------|----------|------------|\n';

    for (const change of this.changes) {
      const from = path.basename(change.from);
      const to = path.relative(process.cwd(), change.to);
      report += `| \`${from}\` | \`${to}\` | ${change.category} | ${change.confidence} |\n`;
    }

    report += `\n**Total moved**: ${this.changes.length} files\n\n`;

    // Add ambiguous files section
    const ambiguous = this.changes.filter(c => c.confidence === 'LOW');
    if (ambiguous.length > 0) {
      report += '#### ⚠️ Ambiguous Files (Low Confidence)\n\n';
      report += 'These files were moved to `docs/orphaned/` and require manual review:\n\n';
      for (const change of ambiguous) {
        const to = path.relative(process.cwd(), change.to);
        report += `- \`${to}\`\n`;
      }
      report += '\n';
    }

    return report;
  }
}

module.exports = OrphanedRootFilesPlugin;
