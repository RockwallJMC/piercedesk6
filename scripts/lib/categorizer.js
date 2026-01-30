/**
 * File Categorizer
 * Analyzes content and determines target location
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('./frontmatter-parser');
const { SYSTEM_KEYWORDS, USER_KEYWORDS, API_KEYWORDS, SYSTEM_PREFIXES } = require('./keywords');

class Categorizer {
  /**
   * Categorize a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} Category result
   */
  static async categorize(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const filename = path.basename(filePath);

    // Priority 1: YAML Frontmatter
    const frontmatterResult = this.checkFrontmatter(content);
    if (frontmatterResult) {
      return {
        target: frontmatterResult.target,
        confidence: 'HIGH',
        reason: `Frontmatter type: ${frontmatterResult.type}`,
        method: 'frontmatter'
      };
    }

    // Priority 2: Filename patterns
    const filenameResult = this.checkFilename(filename);
    if (filenameResult) {
      return {
        target: filenameResult.target,
        confidence: 'HIGH',
        reason: `Filename prefix: ${filenameResult.prefix}`,
        method: 'filename'
      };
    }

    // Priority 3: Content keywords
    const contentResult = this.checkContent(content);
    if (contentResult.confidence === 'HIGH' || contentResult.confidence === 'MEDIUM') {
      return contentResult;
    }

    // Priority 4: Fallback to orphaned
    return {
      target: 'docs/orphaned',
      confidence: 'LOW',
      reason: 'Could not determine category',
      method: 'fallback'
    };
  }

  /**
   * Check YAML frontmatter for type
   */
  static checkFrontmatter(content) {
    if (!content.startsWith('---')) {
      return null;
    }

    try {
      const { data } = matter(content);
      if (data.type) {
        const typeMap = {
          'design': 'docs/system/design',
          'execution': 'docs/system/execution',
          'as-built': 'docs/system/as-builts',
          'plan': 'docs/system/plans',
          'vision': 'docs/system/vision',
          'roadmap': 'docs/system/roadmap',
          'feature': 'docs/user-docs/features',
          'guide': 'docs/user-docs/guides',
          'api': 'docs/user-docs/api'
        };

        if (typeMap[data.type]) {
          return {
            type: data.type,
            target: typeMap[data.type]
          };
        }
      }
    } catch (err) {
      // Invalid frontmatter, continue to next method
    }

    return null;
  }

  /**
   * Check filename for system prefixes
   */
  static checkFilename(filename) {
    for (const prefix of SYSTEM_PREFIXES) {
      if (filename.startsWith(prefix)) {
        const targetMap = {
          'INDEX-': 'docs/system',
          'design-': 'docs/system/design',
          'execution-': 'docs/system/execution',
          'as-built-': 'docs/system/as-builts',
          'plan-': 'docs/system/plans',
          'debug-': 'docs/system/execution',
          'realign-': 'docs/system/execution'
        };

        return {
          prefix,
          target: targetMap[prefix]
        };
      }
    }

    return null;
  }

  /**
   * Check content keywords
   */
  static checkContent(content) {
    // Get first 50 lines
    const lines = content.split('\n').slice(0, 50);
    const sampleContent = lines.join('\n').toLowerCase();

    // Count keyword matches
    const systemScore = this.countKeywords(sampleContent, SYSTEM_KEYWORDS);
    const userScore = this.countKeywords(sampleContent, USER_KEYWORDS);
    const apiScore = this.countKeywords(sampleContent, API_KEYWORDS);

    // Determine category by highest score
    const scores = [
      { category: 'api', score: apiScore, target: 'docs/user-docs/api' },
      { category: 'user', score: userScore, target: 'docs/user-docs/guides' },
      { category: 'system', score: systemScore, target: 'docs/system/execution' }
    ];

    scores.sort((a, b) => b.score - a.score);
    const winner = scores[0];

    // Determine confidence based on score
    let confidence;
    if (winner.score >= 5) {
      confidence = 'HIGH';
    } else if (winner.score >= 2) {
      confidence = 'MEDIUM';
    } else {
      confidence = 'LOW';
    }

    return {
      target: winner.target,
      confidence,
      reason: `Content keywords (${winner.category}): ${winner.score} matches`,
      method: 'content',
      scores: {
        system: systemScore,
        user: userScore,
        api: apiScore
      }
    };
  }

  /**
   * Count keyword occurrences
   */
  static countKeywords(content, keywords) {
    let count = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword.toLowerCase(), 'gi');
      const matches = content.match(regex);
      if (matches) {
        count += matches.length;
      }
    }
    return count;
  }
}

module.exports = Categorizer;
