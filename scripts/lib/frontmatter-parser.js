/**
 * Simple YAML frontmatter parser
 * Replaces gray-matter dependency
 */

/**
 * Parse YAML frontmatter from markdown content
 * @param {string} content - Markdown content
 * @returns {Object} { data, content }
 */
function matter(content) {
  const result = {
    data: {},
    content: content
  };

  // Check if content starts with frontmatter delimiter
  if (!content.startsWith('---')) {
    return result;
  }

  // Find the closing delimiter
  const lines = content.split('\n');
  let endIndex = -1;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return result; // No closing delimiter found
  }

  // Extract frontmatter lines
  const frontmatterLines = lines.slice(1, endIndex);
  const contentLines = lines.slice(endIndex + 1);

  // Parse YAML (simple key: value pairs)
  for (const line of frontmatterLines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      result.data[key] = value.replace(/^["']|["']$/g, '').trim();
    }
  }

  result.content = contentLines.join('\n');

  return result;
}

module.exports = matter;
module.exports.default = matter;
