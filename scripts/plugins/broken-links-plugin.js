/**
 * Broken Links Plugin
 * Detects and fixes broken internal links
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('../lib/file-utils');
const BasePlugin = require('./base-plugin');

class BrokenLinksPlugin extends BasePlugin {
  constructor(config = {}) {
    super(config);
    this.docsRoot = config.docsRoot || 'docs';
    this.dryRun = config.dryRun || false;

    // Link migration patterns (old structure → new structure)
    this.linkPatterns = [
      { from: /_sys_documents\/design\//g, to: 'system/design/' },
      { from: /_sys_documents\/execution\//g, to: 'system/execution/' },
      { from: /_sys_documents\/as-builts\//g, to: 'system/as-builts/' },
      { from: /_sys_documents\/plans\//g, to: 'system/plans/' },
      { from: /_sys_documents\/vision\//g, to: 'system/vision/' },
      { from: /_sys_documents\/roadmap\//g, to: 'system/roadmap/' },
      { from: /_sys_documents\//g, to: 'system/' },
      { from: /docs\/architecture\//g, to: 'docs/user-docs/architecture/' },
      { from: /docs\/features\//g, to: 'docs/user-docs/features/' },
      { from: /docs\/guides\//g, to: 'docs/user-docs/guides/' },
      { from: /docs\/api\//g, to: 'docs/user-docs/api/' }
    ];
  }

  /**
   * Scan for broken links
   */
  async scan() {
    console.log(`\n[${this.name}] Scanning for broken links...`);

    const pattern = path.join(process.cwd(), this.docsRoot, '**/*.md');
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**']
    });

    for (const file of files) {
      await this.checkFileLinks(file);
    }

    console.log(`[${this.name}] Found ${this.findings.length} broken links`);
    return this.findings;
  }

  /**
   * Check links in a file
   */
  async checkFileLinks(filePath) {
    const content = await fs.readFile(filePath, 'utf8');

    // Extract markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, text, url] = match;

      // Skip external links (http/https)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        continue;
      }

      // Skip anchors only
      if (url.startsWith('#')) {
        continue;
      }

      // Check if internal link is broken
      const isBroken = await this.isLinkBroken(filePath, url);
      if (isBroken) {
        // Try to find fixed link
        const fixedUrl = await this.tryFixLink(filePath, url);

        this.logFinding({
          type: 'broken_link',
          file: filePath,
          linkText: text,
          originalUrl: url,
          fixedUrl,
          canAutoFix: !!fixedUrl
        });

        const fileRel = path.relative(process.cwd(), filePath);
        if (fixedUrl) {
          console.log(`  - ${fileRel}: ${url} → ${fixedUrl}`);
        } else {
          console.log(`  - ${fileRel}: ${url} (cannot auto-fix)`);
        }
      }
    }
  }

  /**
   * Check if link is broken
   */
  async isLinkBroken(sourceFile, url) {
    // Remove anchor
    const [urlPath] = url.split('#');

    // Resolve relative to source file
    const sourceDir = path.dirname(sourceFile);
    const targetPath = path.resolve(sourceDir, urlPath);

    try {
      await fs.access(targetPath);
      return false; // Link is valid
    } catch (err) {
      return true; // Link is broken
    }
  }

  /**
   * Try to fix link using migration patterns
   */
  async tryFixLink(sourceFile, url) {
    // Try migration patterns
    for (const pattern of this.linkPatterns) {
      if (pattern.from.test(url)) {
        const fixedUrl = url.replace(pattern.from, pattern.to);

        // Verify fixed link works
        const sourceDir = path.dirname(sourceFile);
        const targetPath = path.resolve(sourceDir, fixedUrl);

        try {
          await fs.access(targetPath);
          return fixedUrl; // Fixed link is valid
        } catch (err) {
          // Fixed link doesn't work either
        }
      }
    }

    // Try searching for the file
    const [urlPath] = url.split('#');
    const filename = path.basename(urlPath);

    // Search for file in docs
    const searchPattern = path.join(process.cwd(), this.docsRoot, '**', filename);
    const matches = await glob(searchPattern);

    if (matches.length === 1) {
      // Found exactly one match, calculate relative path
      const sourceDir = path.dirname(sourceFile);
      const relativePath = path.relative(sourceDir, matches[0]);
      return relativePath.replace(/\\/g, '/'); // Normalize path separators
    }

    // Cannot auto-fix
    return null;
  }

  /**
   * Fix broken links
   */
  async fix() {
    console.log(`\n[${this.name}] Fixing broken links...`);

    // Group findings by file
    const fileMap = new Map();
    for (const finding of this.findings) {
      if (!finding.canAutoFix) {
        continue; // Skip links that cannot be auto-fixed
      }

      if (!fileMap.has(finding.file)) {
        fileMap.set(finding.file, []);
      }
      fileMap.get(finding.file).push(finding);
    }

    // Fix each file
    for (const [file, findings] of fileMap) {
      try {
        await this.fixFileLinks(file, findings);
      } catch (err) {
        console.error(`  ✗ Error fixing ${file}:`, err.message);
      }
    }

    return this.changes;
  }

  /**
   * Fix links in a file
   */
  async fixFileLinks(file, findings) {
    let content = await fs.readFile(file, 'utf8');
    let modified = false;

    for (const finding of findings) {
      const { originalUrl, fixedUrl } = finding;

      // Replace all occurrences of the broken link
      const searchStr = `](${originalUrl})`;
      const replaceStr = `](${fixedUrl})`;

      if (content.includes(searchStr)) {
        content = content.replace(new RegExp(this.escapeRegExp(searchStr), 'g'), replaceStr);
        modified = true;

        this.logChange({
          type: 'link_fixed',
          file,
          from: originalUrl,
          to: fixedUrl
        });
      }
    }

    if (modified) {
      if (this.dryRun) {
        console.log(`  [DRY RUN] Would fix links in: ${path.relative(process.cwd(), file)}`);
      } else {
        await fs.writeFile(file, content, 'utf8');
        console.log(`  ✓ Fixed links in: ${path.relative(process.cwd(), file)}`);
      }
    }
  }

  /**
   * Escape special regex characters
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Generate report section
   */
  async report() {
    if (this.findings.length === 0) {
      return '';
    }

    let report = '### 🔗 Broken Links\n\n';

    // Fixed links
    const fixed = this.changes;
    if (fixed.length > 0) {
      report += '#### ✅ Auto-Fixed Links\n\n';
      report += '| File | Old Link | New Link |\n';
      report += '|------|----------|----------|\n';

      for (const change of fixed) {
        const fileRel = path.relative(process.cwd(), change.file);
        report += `| \`${fileRel}\` | \`${change.from}\` | \`${change.to}\` |\n`;
      }

      report += `\n**Total fixed**: ${fixed.length} links\n\n`;
    }

    // Cannot auto-fix
    const cannotFix = this.findings.filter(f => !f.canAutoFix);
    if (cannotFix.length > 0) {
      report += '#### ⚠️ Manual Review Required\n\n';
      report += 'These links could not be auto-fixed:\n\n';

      for (const finding of cannotFix) {
        const fileRel = path.relative(process.cwd(), finding.file);
        report += `- \`${fileRel}\`: \`${finding.originalUrl}\` - Link target not found\n`;
      }

      report += '\n';
    }

    return report;
  }
}

module.exports = BrokenLinksPlugin;
