/**
 * Intent Detector Service
 * Classifies user messages into HR module intents
 * so we know which MongoDB collections to query before calling Gemini
 */

const INTENTS = {
  EMPLOYEES:            'employees',
  PAYROLL:              'payroll',
  ABSENCE:              'absence',
  EXPENSES:             'expenses',
  APPRAISAL:            'appraisal',
  KPI:                  'kpi',
  APPRAISAL_PERIOD:     'appraisal_period',
  LEARNING:             'learning',
  CALENDAR:             'calendar',
  MEETINGS:             'meetings',
  HR_SETTINGS:          'hr_settings',
  REPORTS:              'reports',
  DOCUMENT_GENERATION:  'document_generation',
  GENERAL:              'general',
};

// Keyword maps for fast local intent detection (no AI call needed here)
const INTENT_KEYWORDS = {
  [INTENTS.EMPLOYEES]: [
    'employee', 'staff', 'hire', 'hired', 'department', 'team', 'headcount',
    'designation', 'role', 'job type', 'active', 'inactive', 'onboard',
    'who works', 'how many people', 'new hire', 'pending employees',
    'work anniversary', 'anniversaries', 'start date', 'employment start',
  ],
  [INTENTS.PAYROLL]: [
    'payroll', 'salary', 'pay', 'earnings', 'gross', 'net pay', 'disbursed',
    'payment', 'wage', 'compensation', 'deduction', 'tax', 'paye',
    'paid', 'payslip', 'monthly pay',
  ],
  [INTENTS.ABSENCE]: [
    'absence', 'leave', 'sick', 'annual leave', 'days off', 'holiday',
    'time off', 'absent', 'attendance', 'away', 'off work',
    'how many days', 'leave balance', 'who is on leave',
  ],
  [INTENTS.EXPENSES]: [
    'expense', 'expenses', 'reimbursement', 'claim', 'receipt', 'spend',
    'spending', 'cost', 'budget', 'purchase', 'petty cash', 'travel expense',
  ],
  [INTENTS.APPRAISAL]: [
    'appraisal', 'performance', 'review', 'kpi', 'rating', 'evaluation',
    'score', 'assessment', 'feedback', 'goal', 'target', 'achievement',
    'top performer', 'underperform', 'appraise',
  ],
  [INTENTS.LEARNING]: [
    'course', 'training', 'learning', 'lms', 'certification', 'skill',
    'develop', 'module', 'lesson', 'enrolled', 'completed course',
  ],
  [INTENTS.CALENDAR]: [
    'calendar', 'event', 'birthday', 'anniversary', 'schedule',
    'upcoming', 'remind', 'this week', 'next week',
  ],
  [INTENTS.MEETINGS]: [
    'meeting', 'schedule meeting', 'book meeting', 'create meeting',
    'team meeting', 'standup', 'sync', 'call', 'invite',
  ],
  [INTENTS.KPI]: [
    'kpi', 'key performance', 'kpi group', 'kpi score', 'set kpi',
    'assign kpi', 'employee kpi', 'performance indicator',
  ],
  [INTENTS.APPRAISAL_PERIOD]: [
    'appraisal period', 'review period', 'performance period',
    'new appraisal period', 'create period', 'close period',
    'open period', 'appraisal cycle', 'period progress',
  ],
  [INTENTS.HR_SETTINGS]: [
    'department', 'branch', 'designation', 'holiday', 'leave type',
    'expense type', 'hr settings', 'settings', 'add department',
    'create department', 'add branch', 'add designation',
    'create holiday', 'payroll setting', 'set up', 'set up account',
    'configure account', 'configure hr', 'initial setup',
  ],
  [INTENTS.REPORTS]: [
    'report', 'analytics', 'summary report', 'employee report',
    'absence report', 'expense report', 'payroll report', 'generate report',
    'export', 'statistics', 'overview', 'headcount', 'turnover',
  ],
  [INTENTS.DOCUMENT_GENERATION]: [
    'draft', 'write', 'generate', 'create', 'letter', 'offer letter',
    'warning letter', 'termination', 'promotion letter', 'contract',
    'employment letter', 'document', 'sales letter',
  ],
};

/**
 * Detects the primary intent of a user message.
 * Uses keyword scoring — no AI token cost for this step.
 */
async function detectIntent(message) {
  const lowerMessage = message.toLowerCase();
  const scores = {};

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    scores[intent] = 0;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        // Multi-word keywords score higher (more specific match)
        scores[intent] += keyword.split(' ').length;
      }
    }
  }

  // Find top intent
  let topIntent = INTENTS.GENERAL;
  let topScore = 0;

  for (const [intent, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score;
      topIntent = intent;
    }
  }

  // Secondary intents (for cross-module queries)
  const secondaryIntents = Object.entries(scores)
    .filter(([intent, score]) => score > 0 && intent !== topIntent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([intent]) => intent);

  // Extract time and entity filters from the message
  const timeFilter   = extractTimeFilter(lowerMessage);
  const entityFilter = extractEntityFilter(message);

  return {
    primary:    topIntent,
    secondary:  secondaryIntents,
    confidence: topScore > 0 ? Math.min(topScore / 5, 1) : 0,
    filters: {
      time:   timeFilter,
      entity: entityFilter,
    },
    rawMessage: message,
  };
}

// ─── Filter Extractors ────────────────────────────────────────────────────────

function extractTimeFilter(message) {
  const filters = {};
  const now = new Date();

  if (message.includes('this month')) {
    filters.month = now.getMonth() + 1;
    filters.year  = now.getFullYear();
  } else if (message.includes('last month')) {
    const last    = new Date(now.getFullYear(), now.getMonth() - 1);
    filters.month = last.getMonth() + 1;
    filters.year  = last.getFullYear();
  } else if (message.includes('this year') || message.includes('this quarter')) {
    filters.year = now.getFullYear();
  } else if (message.includes('this week')) {
    filters.week = true;
  } else if (message.includes('today')) {
    filters.today = true;
  }

  // Explicit year e.g. "2025", "2026"
  const yearMatch = message.match(/\b(202\d)\b/);
  if (yearMatch) filters.year = parseInt(yearMatch[1]);

  // Quarter e.g. "Q1", "q3"
  const quarterMatch = message.match(/q([1-4])/i);
  if (quarterMatch) filters.quarter = parseInt(quarterMatch[1]);

  return Object.keys(filters).length > 0 ? filters : null;
}

function extractEntityFilter(message) {
  const filters = {};
  const lower = message.toLowerCase();

  // Don't use department as a search filter when the user is updating/transferring
  // e.g. "update department of X from A to Product" — Product is the target, not a filter
  const isUpdateOrTransfer = /\b(update|change|move|transfer|reassign)\b/i.test(message)
    && /\b(from|to)\b/i.test(message);

  const departments = [
    'sales', 'engineering', 'finance', 'marketing', 'hr', 'management',
    'operations', 'product', 'design', 'legal', 'customer success',
    'frontend development', 'backend', 'full stack',
  ];

  if (!isUpdateOrTransfer) {
    for (const dept of departments) {
      if (lower.includes(dept)) {
        filters.department = dept.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }
  }

  if (lower.includes('pending'))  filters.status = 'pending';
  if (lower.includes('active'))   filters.status = 'active';
  if (lower.includes('inactive')) filters.status = 'inactive';
  if (lower.includes('approved')) filters.status = 'approved';
  if (lower.includes('declined')) filters.status = 'declined';
  if (lower.includes('disbursed'))filters.status = 'disbursed';

  return Object.keys(filters).length > 0 ? filters : null;
}

module.exports = { detectIntent, INTENTS };
