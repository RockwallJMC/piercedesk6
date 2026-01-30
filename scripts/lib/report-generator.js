/**
 * PR Report Generator
 * Generates comprehensive PR reports from plugin results
 */

class ReportGenerator {
  constructor(plugins) {
    this.plugins = plugins;
  }

  /**
   * Generate complete PR report
   */
  async generate() {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const trigger = process.env.GITHUB_ACTOR ? 'github-user' : 'schedule';

    let report = `## 📚 Documentation Maintenance Report\n\n`;
    report += `**Run Date**: ${timestamp} UTC\n`;
    report += `**Triggered By**: ${trigger}\n\n`;
    report += `---\n\n`;

    // Get reports from each plugin
    for (const plugin of this.plugins) {
      const pluginReport = await plugin.report();
      if (pluginReport) {
        report += pluginReport;
        report += `---\n\n`;
      }
    }

    // Summary section
    report += await this.generateSummary();

    return report;
  }

  /**
   * Generate summary section
   */
  async generateSummary() {
    const stats = this.plugins.map(p => p.getStats());

    let totalFindings = 0;
    let totalChanges = 0;

    for (const stat of stats) {
      totalFindings += stat.findingsCount;
      totalChanges += stat.changesCount;
    }

    let summary = `### 📊 Summary\n\n`;

    // Count by plugin type
    const sourceScanner = this.plugins.find(p => p.name === 'SourceFileScannerPlugin');
    const missingFiles = this.plugins.find(p => p.name === 'MissingFilesPlugin');
    const nameConvention = this.plugins.find(p => p.name === 'NameConventionPlugin');
    const brokenLinks = this.plugins.find(p => p.name === 'BrokenLinksPlugin');
    const orphanedRoot = this.plugins.find(p => p.name === 'OrphanedRootFilesPlugin');

    if (sourceScanner) {
      summary += `- ✅ Moved from /src: ${sourceScanner.changes.length} files\n`;
    }

    if (orphanedRoot) {
      summary += `- ✅ Cleaned from root: ${orphanedRoot.changes.length} files\n`;
    }

    if (missingFiles) {
      summary += `- ✅ Created missing: ${missingFiles.changes.length} files\n`;
    }

    if (nameConvention) {
      summary += `- ✅ Renamed: ${nameConvention.changes.length} files\n`;
    }

    if (brokenLinks) {
      summary += `- ✅ Fixed links: ${brokenLinks.changes.length} links\n`;
    }

    // Manual review items
    const manualReviewCount = this.countManualReviewItems();
    if (manualReviewCount > 0) {
      summary += `- ⚠️  Manual review: ${manualReviewCount} items\n`;
    }

    summary += `\n**Total changes**: ${totalChanges}\n\n`;

    // No changes message
    if (totalChanges === 0) {
      summary = `### ✨ No Issues Found\n\nAll documentation is well-organized and up-to-date!\n\n`;
    }

    return summary;
  }

  /**
   * Count items requiring manual review
   */
  countManualReviewItems() {
    let count = 0;

    for (const plugin of this.plugins) {
      // Low confidence categorizations
      const lowConfidence = plugin.changes.filter(c => c.confidence === 'LOW');
      count += lowConfidence.length;

      // Broken links that couldn't be fixed
      if (plugin.name === 'BrokenLinksPlugin') {
        const cannotFix = plugin.findings.filter(f => !f.canAutoFix);
        count += cannotFix.length;
      }
    }

    return count;
  }

  /**
   * Check if there are any changes
   */
  hasChanges() {
    return this.plugins.some(p => p.changes.length > 0);
  }
}

module.exports = ReportGenerator;
