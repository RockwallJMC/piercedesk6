/**
 * Source File Scanner Plugin
 * Scans /src for .md files and categorizes them
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('../lib/file-utils');
const BasePlugin = require('./base-plugin');
const Categorizer = require('../lib/categorizer');

class SourceFileScannerPlugin extends BasePlugin {
  constructor(config = {}) {
    super(config);
    this.sourceDir = config.sourceDir || 'src';
    this.dryRun = config.dryRun || false;
  }

  /**
   * Scan /src for .md files
   */
  async scan() {
    console.log(`\n[${this.name}] Scanning ${this.sourceDir} for .md files...`);

    const pattern = `${this.sourceDir}/**/*.md`;
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**'],
      absolute: true
    });

    console.log(`[${this.name}] Found ${files.length} markdown files`);

    for (const file of files) {
      try {
        const category = await Categorizer.categorize(file);

        this.logFinding({
          type: 'md_file_in_src',
          file,
          category: category.target,
          confidence: category.confidence,
          reason: category.reason,
          method: category.method
        });

        console.log(`  - ${path.relative(process.cwd(), file)}`);
        console.log(`    → ${category.target} (${category.confidence})`);
      } catch (err) {
        console.error(`  ✗ Error categorizing ${file}:`, err.message);
      }
    }

    return this.findings;
  }

  /**
   * Move files to target locations
   */
  async fix() {
    console.log(`\n[${this.name}] Moving files...`);

    for (const finding of this.findings) {
      try {
        const { file, category } = finding;
        const filename = path.basename(file);
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
          console.log(`    ${path.relative(process.cwd(), file)}`);
          console.log(`    → ${path.relative(process.cwd(), finalTargetPath)}`);
        } else {
          // Create target directory
          await fs.mkdir(targetDir, { recursive: true });

          // Move file
          await fs.rename(file, finalTargetPath);

          console.log(`  ✓ Moved:`);
          console.log(`    ${path.relative(process.cwd(), file)}`);
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

    let report = '### 📦 Files Moved from /src\n\n';
    report += '| Original Path | New Path | Category | Confidence |\n';
    report += '|--------------|----------|----------|------------|\n';

    for (const change of this.changes) {
      const from = path.relative(process.cwd(), change.from);
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

module.exports = SourceFileScannerPlugin;
