/**
 * Keywords for categorizing documentation files
 */

const SYSTEM_KEYWORDS = [
  'verification',
  'test results',
  'implementation',
  'phase',
  'blocker',
  'risk register',
  'index document',
  'tracking',
  'frontmatter',
  'as-built',
  'execution log',
  'design doc',
  'design document',
  'architecture',
  'technical design',
  'implementation plan',
  'test evidence',
  'verification evidence',
  'progress tracking'
];

const USER_KEYWORDS = [
  'getting started',
  'how to',
  'user guide',
  'tutorial',
  'step-by-step',
  'feature guide',
  'user journey',
  'workflow',
  'quick start',
  'walkthrough',
  'best practices',
  'tips and tricks',
  'common tasks',
  'user manual'
];

const API_KEYWORDS = [
  'endpoint',
  'request',
  'response',
  'authentication',
  'authorization',
  'api reference',
  'rest api',
  'graphql',
  'http method',
  'status code',
  'query parameter',
  'request body',
  'response body',
  'api documentation',
  'webhook',
  'callback'
];

const SYSTEM_PREFIXES = [
  'INDEX-',
  'design-',
  'execution-',
  'as-built-',
  'plan-',
  'debug-',
  'realign-'
];

module.exports = {
  SYSTEM_KEYWORDS,
  USER_KEYWORDS,
  API_KEYWORDS,
  SYSTEM_PREFIXES
};
