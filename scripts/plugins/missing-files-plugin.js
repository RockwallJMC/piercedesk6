/**
 * Missing Files Plugin
 * Creates missing AGENT.md and README.md files
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('../lib/file-utils');
const BasePlugin = require('./base-plugin');

class MissingFilesPlugin extends BasePlugin {
  constructor(config = {}) {
    super(config);
    this.docsRoot = config.docsRoot || 'docs';
    this.dryRun = config.dryRun || false;

    // Directories that should have AGENT.md
    this.agentMdDirs = [
      'docs/system/design',
      'docs/system/execution',
      'docs/system/as-builts',
      'docs/system/plans',
      'docs/system/vision',
      'docs/system/roadmap',
      'docs/user-docs/features',
      'docs/user-docs/guides',
      'docs/user-docs/api'
    ];
  }

  /**
   * Scan for missing files
   */
  async scan() {
    console.log(`\n[${this.name}] Scanning for missing files...`);

    // Check for missing AGENT.md files
    await this.checkMissingAgentMd();

    // Check for missing README.md files
    await this.checkMissingReadme();

    console.log(`[${this.name}] Found ${this.findings.length} missing files`);
    return this.findings;
  }

  /**
   * Check for missing AGENT.md files
   */
  async checkMissingAgentMd() {
    for (const dir of this.agentMdDirs) {
      const agentMdPath = path.join(process.cwd(), dir, 'AGENT.md');

      try {
        await fs.access(agentMdPath);
        // File exists, skip
      } catch (err) {
        // File doesn't exist
        this.logFinding({
          type: 'missing_agent_md',
          directory: dir,
          path: agentMdPath
        });
        console.log(`  - Missing: ${dir}/AGENT.md`);
      }
    }
  }

  /**
   * Check for missing README.md files in subdirectories
   */
  async checkMissingReadme() {
    // Find all directories under docs/
    const dirs = await glob(`${this.docsRoot}/**/`, {
      ignore: ['**/node_modules/**'],
      absolute: true
    });

    for (const dir of dirs) {
      // Skip if it's the root docs directory
      if (dir === path.join(process.cwd(), this.docsRoot)) {
        continue;
      }

      const readmePath = path.join(dir, 'README.md');

      try {
        await fs.access(readmePath);
        // File exists, skip
      } catch (err) {
        // File doesn't exist
        const relativeDir = path.relative(process.cwd(), dir);
        this.logFinding({
          type: 'missing_readme',
          directory: relativeDir,
          path: readmePath
        });
        console.log(`  - Missing: ${relativeDir}/README.md`);
      }
    }
  }

  /**
   * Create missing files
   */
  async fix() {
    console.log(`\n[${this.name}] Creating missing files...`);

    for (const finding of this.findings) {
      try {
        if (finding.type === 'missing_agent_md') {
          await this.createAgentMd(finding);
        } else if (finding.type === 'missing_readme') {
          await this.createReadme(finding);
        }
      } catch (err) {
        console.error(`  ✗ Error creating ${finding.path}:`, err.message);
      }
    }

    return this.changes;
  }

  /**
   * Create AGENT.md file
   */
  async createAgentMd(finding) {
    const { directory, path: filePath } = finding;
    const dirName = path.basename(directory);

    // Determine directory type and purpose
    const dirPurposes = {
      'design': 'Pre-implementation architecture and design decisions',
      'execution': 'Implementation logs, progress tracking, and verification evidence',
      'as-builts': 'Current deployed state documentation',
      'plans': 'Detailed implementation plans with step-by-step instructions',
      'vision': 'Product vision and strategic direction',
      'roadmap': 'Strategic planning and feature roadmaps',
      'features': 'User-facing feature guides and capabilities documentation',
      'guides': 'How-to guides, tutorials, and step-by-step instructions',
      'api': 'API reference documentation and integration guides'
    };

    const purpose = dirPurposes[dirName] || 'Documentation files';
    const isSystemDocs = directory.startsWith('docs/system');

    const content = this.generateAgentMdContent(dirName, purpose, isSystemDocs);

    if (this.dryRun) {
      console.log(`  [DRY RUN] Would create: ${path.relative(process.cwd(), filePath)}`);
    } else {
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`  ✓ Created: ${path.relative(process.cwd(), filePath)}`);
    }

    this.logChange({
      type: 'file_created',
      fileType: 'AGENT.md',
      path: filePath,
      directory
    });
  }

  /**
   * Generate AGENT.md content
   */
  generateAgentMdContent(dirName, purpose, isSystemDocs) {
    const date = new Date().toISOString().split('T')[0];

    if (isSystemDocs) {
      return `# AGENT.md - ${dirName.charAt(0).toUpperCase() + dirName.slice(1)}

**Purpose**: Governance rules for ${dirName} documentation

**Last Updated**: ${date}

---

## Directory Purpose

${purpose}

## File Naming Conventions

### Format

\`\`\`
${dirName}-{feature|phase}-{topic}.md
\`\`\`

### Examples

- \`${dirName}-phase1.1-crm-schema.md\`
- \`${dirName}-authentication-flow.md\`
- \`${dirName}-database-design.md\`

### Rules

- **Prefix**: All files must start with \`${dirName}-\`
- **Separator**: Use dashes (-) not underscores (_)
- **Case**: All lowercase
- **Descriptive**: Clear, concise topic names

## Required Frontmatter

All files in this directory must include YAML frontmatter:

\`\`\`yaml
---
type: "${dirName}"
status: "planned" | "in-progress" | "complete" | "blocked"
version: "X.Y"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---
\`\`\`

## Cross-Referencing Standards

Files in this directory should link to:
- Parent INDEX file (if part of feature)
- Related design/execution documents
- As-built documentation (for current state)
- External resources when relevant

**Link Format**:
\`\`\`markdown
See [Document Name](../path/to/document.md)
\`\`\`

## Quality Standards

- **Evidence-based**: Include verification command output
- **Code references**: Use file:line format (e.g., \`src/file.ts:42\`)
- **Version control**: Update \`updated\` field on every change
- **Status tracking**: Keep status current

## Common Mistakes to Avoid

❌ Missing prefix in filename
✅ Always start with \`${dirName}-\`

❌ Using spaces or underscores
✅ Use dashes for separation

❌ Missing frontmatter
✅ Include all required fields

❌ Broken cross-references
✅ Test all links before committing

---

**Maintained by**: Documentation Guardian
**Auto-generated**: ${date}
`;
    } else {
      // User docs AGENT.md
      return `# AGENT.md - ${dirName.charAt(0).toUpperCase() + dirName.slice(1)}

**Purpose**: Governance rules for ${dirName} documentation

**Last Updated**: ${date}

---

## Directory Purpose

${purpose}

## File Naming Conventions

### Format

\`\`\`
{topic}-{subtopic}.md
\`\`\`

### Examples

- \`getting-started.md\`
- \`managing-contacts.md\`
- \`creating-opportunities.md\`

### Rules

- **No prefixes**: User-friendly names only
- **Separator**: Use dashes (-) not underscores (_)
- **Case**: All lowercase
- **Task-oriented**: Name files by user tasks

## Writing Style

- **Audience**: End users and developers (non-technical)
- **Tone**: Clear, friendly, helpful
- **Structure**: Step-by-step instructions with examples
- **Jargon**: Avoid or explain technical terms

## Content Structure

### Required Sections

1. **Title**: Clear, descriptive heading
2. **Overview**: Brief introduction (1-2 paragraphs)
3. **Prerequisites**: What users need before starting
4. **Steps**: Numbered, actionable instructions
5. **Examples**: Code samples or screenshots
6. **Related**: Links to related documentation

### Optional Sections

- Troubleshooting
- FAQs
- Advanced topics
- Next steps

## Screenshots

- **Format**: PNG or JPG
- **Location**: \`screenshots/\` subdirectory
- **Naming**: Descriptive names (e.g., \`login-form.png\`)
- **Alt text**: Always include for accessibility
- **Currency**: Update when UI changes

## Cross-Referencing

Link to:
- Related user guides
- API documentation (if applicable)
- System architecture docs (for context)

**Link Format**:
\`\`\`markdown
See [Guide Name](./other-guide.md)
\`\`\`

## Quality Standards

- **Clear**: Simple language, no jargon
- **Complete**: All necessary context included
- **Tested**: All steps verified to work
- **Visual**: Screenshots for complex steps
- **Current**: Updated with code changes

## Common Mistakes to Avoid

❌ Technical prefixes in filenames
✅ User-friendly, task-oriented names

❌ Assuming technical knowledge
✅ Explain concepts clearly

❌ Missing screenshots
✅ Visual aids for complex steps

❌ Outdated content
✅ Update docs with code changes

---

**Maintained by**: Documentation Guardian
**Auto-generated**: ${date}
`;
    }
  }

  /**
   * Create README.md file
   */
  async createReadme(finding) {
    const { directory, path: filePath } = finding;

    // List files in directory
    const files = await this.listMarkdownFiles(directory);

    const content = await this.generateReadmeContent(directory, files);

    if (this.dryRun) {
      console.log(`  [DRY RUN] Would create: ${path.relative(process.cwd(), filePath)}`);
    } else {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`  ✓ Created: ${path.relative(process.cwd(), filePath)}`);
    }

    this.logChange({
      type: 'file_created',
      fileType: 'README.md',
      path: filePath,
      directory
    });
  }

  /**
   * List markdown files in directory
   */
  async listMarkdownFiles(directory) {
    try {
      const files = await fs.readdir(directory);
      return files
        .filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'AGENT.md')
        .sort();
    } catch (err) {
      return [];
    }
  }

  /**
   * Generate README.md content
   */
  async generateReadmeContent(directory, files) {
    const dirName = path.basename(directory);
    const title = dirName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    let content = `# ${title}\n\n`;

    // Add description based on directory
    const descriptions = {
      'design': 'Pre-implementation architecture and design decisions.',
      'execution': 'Implementation logs, progress tracking, and verification evidence.',
      'as-builts': 'Current deployed state documentation.',
      'plans': 'Detailed implementation plans with step-by-step instructions.',
      'vision': 'Product vision and strategic direction.',
      'roadmap': 'Strategic planning and feature roadmaps.',
      'features': 'User-facing feature guides and capabilities documentation.',
      'guides': 'How-to guides, tutorials, and step-by-step instructions.',
      'api': 'API reference documentation and integration guides.'
    };

    content += descriptions[dirName] || 'Documentation files in this directory.';
    content += '\n\n';

    // List files
    if (files.length > 0) {
      content += '## Contents\n\n';
      for (const file of files) {
        // Try to get first heading from file
        const title = await this.getFileTitle(path.join(directory, file));
        content += `- [${file}](./${file})`;
        if (title) {
          content += ` - ${title}`;
        }
        content += '\n';
      }
      content += '\n';
    }

    // Add navigation
    content += '## Related Documentation\n\n';
    content += '- [Parent Directory](../README.md)\n';

    // Add governance link
    const hasAgentMd = files.includes('AGENT.md') ||
                       await this.fileExists(path.join(directory, 'AGENT.md'));
    if (hasAgentMd) {
      content += '- [Governance Rules](./AGENT.md)\n';
    }

    content += '\n---\n\n';
    content += `**Last Updated**: ${new Date().toISOString().split('T')[0]}\n`;

    return content;
  }

  /**
   * Get first heading from file
   */
  async getFileTitle(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const match = content.match(/^#\s+(.+)$/m);
      return match ? match[1] : null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Generate report section
   */
  async report() {
    if (this.changes.length === 0) {
      return '';
    }

    let report = '### ✨ Files Created\n\n';

    // Group by file type
    const agentMdFiles = this.changes.filter(c => c.fileType === 'AGENT.md');
    const readmeFiles = this.changes.filter(c => c.fileType === 'README.md');

    if (agentMdFiles.length > 0) {
      report += '#### AGENT.md Files\n\n';
      for (const change of agentMdFiles) {
        const relativePath = path.relative(process.cwd(), change.path);
        report += `- \`${relativePath}\`\n`;
      }
      report += '\n';
    }

    if (readmeFiles.length > 0) {
      report += '#### README.md Files\n\n';
      for (const change of readmeFiles) {
        const relativePath = path.relative(process.cwd(), change.path);
        report += `- \`${relativePath}\`\n`;
      }
      report += '\n';
    }

    report += `**Total created**: ${this.changes.length} files\n\n`;

    return report;
  }
}

module.exports = MissingFilesPlugin;
