#!/usr/bin/env node

/**
 * Documentation Maintenance Script
 * Orchestrates all maintenance plugins
 */

const fs = require('fs').promises;
const path = require('path');

// Import plugins
const SourceFileScannerPlugin = require('./plugins/source-file-scanner-plugin');
const OrphanedRootFilesPlugin = require('./plugins/orphaned-root-files-plugin');
const MissingFilesPlugin = require('./plugins/missing-files-plugin');
const NameConventionPlugin = require('./plugins/name-convention-plugin');
const BrokenLinksPlugin = require('./plugins/broken-links-plugin');

// Import utilities
const ReportGenerator = require('./lib/report-generator');

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('📚 Documentation Maintenance');
  console.log('='.repeat(60));

  // Parse arguments
  const isDryRun = process.argv.includes('--dry-run');

  if (isDryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  const config = {
    dryRun: isDryRun,
    sourceDir: 'src',
    docsRoot: 'docs'
  };

  // Initialize plugins in execution order
  const plugins = [
    new SourceFileScannerPlugin(config),
    new OrphanedRootFilesPlugin(config),
    new MissingFilesPlugin(config),
    new NameConventionPlugin(config),
    new BrokenLinksPlugin(config)
  ];

  console.log(`\n📋 Initialized ${plugins.length} plugins\n`);

  // Execute plugins
  try {
    for (const plugin of plugins) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Running: ${plugin.name}`);
      console.log(`${'='.repeat(60)}`);

      // Scan for issues
      await plugin.scan();

      // Apply fixes
      if (plugin.findings.length > 0) {
        await plugin.fix();
      } else {
        console.log(`  ✨ No issues found`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('Generating Report');
    console.log(`${'='.repeat(60)}\n`);

    // Generate report
    const reportGenerator = new ReportGenerator(plugins);
    const report = await reportGenerator.generate();

    // Write report to file
    const reportPath = path.join(process.cwd(), '.maintenance-report.md');
    await fs.writeFile(reportPath, report, 'utf8');
    console.log(`✓ Report written to: ${reportPath}\n`);

    // Set GitHub Actions outputs
    if (process.env.GITHUB_ACTIONS === 'true') {
      const hasChanges = reportGenerator.hasChanges();
      console.log(`::set-output name=has_changes::${hasChanges}`);
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('Summary');
    console.log(`${'='.repeat(60)}\n`);

    for (const plugin of plugins) {
      const stats = plugin.getStats();
      console.log(`${plugin.name}:`);
      console.log(`  Findings: ${stats.findingsCount}`);
      console.log(`  Changes: ${stats.changesCount}`);
    }

    const totalChanges = plugins.reduce((sum, p) => sum + p.changes.length, 0);

    if (totalChanges === 0) {
      console.log(`\n✨ All documentation is well-organized!\n`);
    } else {
      console.log(`\n✅ Total changes: ${totalChanges}\n`);
    }

    if (isDryRun) {
      console.log(`🔍 DRY RUN COMPLETE - No files were actually modified\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run
main();
