/**
 * Base Plugin Class
 * All maintenance plugins extend this class
 */
class BasePlugin {
  constructor(config = {}) {
    this.name = this.constructor.name;
    this.config = config;
    this.findings = [];
    this.changes = [];
  }

  /**
   * Scan for issues
   * @returns {Promise<Array>} Array of findings
   */
  async scan() {
    throw new Error(`${this.name}: scan() must be implemented`);
  }

  /**
   * Apply fixes
   * @returns {Promise<Array>} Array of changes made
   */
  async fix() {
    throw new Error(`${this.name}: fix() must be implemented`);
  }

  /**
   * Generate report section for PR
   * @returns {Promise<string>} Markdown report section
   */
  async report() {
    throw new Error(`${this.name}: report() must be implemented`);
  }

  /**
   * Log finding
   */
  logFinding(finding) {
    this.findings.push({
      timestamp: new Date().toISOString(),
      plugin: this.name,
      ...finding
    });
  }

  /**
   * Log change
   */
  logChange(change) {
    this.changes.push({
      timestamp: new Date().toISOString(),
      plugin: this.name,
      ...change
    });
  }

  /**
   * Get summary stats
   */
  getStats() {
    return {
      plugin: this.name,
      findingsCount: this.findings.length,
      changesCount: this.changes.length
    };
  }
}

module.exports = BasePlugin;
