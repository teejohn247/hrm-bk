// /**
//  * Mutation Builder
//  * Uses Groq (LLM) to parse a natural-language HR mutation request into a
//  * structured action object that mutationExecutor.js can run against MongoDB.
//  *
//  * Supported actions:
//  *   approve  — set status = Approved on leave / expense / appraisal
//  *   reject   — set status = Declined / Rejected + optional comment
//  *   create   — insert a new leave request or expense request
//  *   update   — update specific fields on employee / leave / expense
//  *   delete   — remove a record (admin-only)
//  *
//  * Supported entities: leave | expense | appraisal | employee | announcement
//  */

// const OpenAI = require('openai');

// const groq = new OpenAI({
//   baseURL: 'https://api.groq.com/openai/v1',
//   apiKey:  process.env.GROQ_API_KEY,
// });

// const MUTATION_MODEL = 'openai/gpt-oss-120b';

// // ─── Keyword detection (fast, no LLM cost) ────────────────────────────────────

// const MUTATION_KEYWORDS = {
//   approve:  ['approve', 'accept', 'grant', 'authorise', 'authorize'],
//   reject:   ['reject', 'decline', 'deny', 'disapprove', 'refuse'],
//   create:   ['create', 'add', 'submit', 'apply for', 'request', 'raise', 'file', 'book', 'invite', 'hire', 'onboard', 'register', 'new employee', 'new staff'],
//   update:   ['update', 'change', 'edit', 'modify', 'set', 'mark'],
//   delete:   ['delete', 'remove', 'cancel'],
// };

// const ENTITY_KEYWORDS = {
//   leave:            ['leave', 'absence', 'time off', 'day off', 'vacation', 'sick leave', 'annual leave'],
//   expense:          ['expense', 'claim', 'reimbursement', 'spend', 'purchase'],
//   appraisal:        ['appraisal request', 'appraisal review', 'performance review'],
//   appraisalPeriod:  ['appraisal period', 'review period', 'performance period', 'appraisal cycle'],
//   kpi:              ['kpi', 'key performance', 'kpi group', 'performance indicator'],
//   employeeKpi:      ['employee kpi', 'assign kpi', 'kpi to employee'],
//   employee:         ['employee', 'staff', 'worker', 'hire', 'onboard', 'new hire', 'profile'],
//   meeting:          ['meeting', 'schedule meeting', 'team meeting', 'standup'],
//   department:       ['department'],
//   branch:           ['branch', 'office', 'location'],
//   designation:      ['designation', 'job title', 'position', 'role'],
//   holiday:          ['holiday', 'public holiday', 'day off'],
//   announcement:     ['announcement', 'notice', 'post', 'notice board'],
// };

// /**
//  * Returns true if the message contains mutation keywords.
//  * Used by the chat route to decide whether to run the mutation pipeline.
//  */
// function isMutationIntent(message) {
//   const lower = message.toLowerCase();
//   return Object.values(MUTATION_KEYWORDS).some(keywords =>
//     keywords.some(kw => lower.includes(kw))
//   );
// }

// /**
//  * Fast local detection of action + entity before calling LLM.
//  * Returns { action, entity } or null if unclear.
//  */
// function quickDetect(message) {
//   const lower = message.toLowerCase();
//   let action = null;
//   let entity = null;

//   for (const [act, keywords] of Object.entries(MUTATION_KEYWORDS)) {
//     if (keywords.some(kw => lower.includes(kw))) { action = act; break; }
//   }
//   for (const [ent, keywords] of Object.entries(ENTITY_KEYWORDS)) {
//     if (keywords.some(kw => lower.includes(kw))) { entity = ent; break; }
//   }

//   return action && entity ? { action, entity } : null;
// }

// // ─── LLM Extraction ──────────────────────────────────────────────────────────

// const EXTRACT_SYSTEM_PROMPT = `You are a JSON extraction assistant for an HR system.
// Given a user's natural-language HR command (or a multi-turn conversation where the user is answering clarifying questions), extract a structured mutation object with ALL details collected across the conversation.

// Return ONLY valid JSON — no explanation, no markdown.

// Schema:
// {
//   "action": "approve" | "reject" | "create" | "update" | "delete" | "close" | "activate",
//   "entity": "leave" | "expense" | "appraisal" | "appraisalPeriod" | "kpi" | "employeeKpi" | "employee" | "meeting" | "department" | "branch" | "designation" | "holiday" | "announcement",
//   "filters": {
//     "employeeName": string or null,
//     "employeeId": string or null,
//     "recordId": string or null,
//     "status": string or null,
//     "leaveType": string or null,
//     "periodName": string or null,
//     "name": string or null
//   },
//   "data": {
//     "status": string or null,
//     "comment": string or null,
//     "leaveTypeName": string or null,
//     "leaveStartDate": "YYYY-MM-DD" or null,
//     "leaveEndDate": "YYYY-MM-DD" or null,
//     "reason": string or null,
//     "amount": number or null,
//     "expenseTypeName": string or null,
//     "expenseDate": "YYYY-MM-DD" or null,
//     "description": string or null,
//     "firstName": string or null,
//     "lastName": string or null,
//     "email": string or null,
//     "phoneNumber": string or null,
//     "gender": "Male" | "Female" | "Other" or null,
//     "dateOfBirth": "YYYY-MM-DD" or null,
//     "department": string or null,
//     "designation": string or null,
//     "employmentType": "Full-time" | "Part-time" | "Contract" | "Intern" or null,
//     "employmentStartDate": "YYYY-MM-DD" or null,
//     "companyRole": string or null,
//     "salaryScale": string or null,
//     "title": string or null,
//     "content": string or null,
//     "announcementType": "all" | "department" | "individual" or null,
//     "priority": "low" | "medium" | "high" or null,
//     "meetingStartTime": "ISO datetime" or null,
//     "meetingEndTime": "ISO datetime" or null,
//     "location": "Online" | "Offline" or null,
//     "invitedGuests": [{"employeeName": string}] or null,
//     "departmentName": string or null,
//     "branchName": string or null,
//     "branchCode": string or null,
//     "designationName": string or null,
//     "grade": number or null,
//     "holidayName": string or null,
//     "date": "YYYY-MM-DD" or null,
//     "appraisalPeriodName": string or null,
//     "startDate": "YYYY-MM-DD" or null,
//     "endDate": "YYYY-MM-DD" or null,
//     "kpiName": string or null,
//     "kpiDescription": string or null,
//     "weight": number or null,
//     "target": number or null,
//     "managerName": string or null,
//     "managerId": string or null
//   },
//   "confidence": 0.0 to 1.0
// }

// Rules:
// - For "approve": set data.status = "Approved"
// - For "reject": set data.status = "Declined"
// - For "close" appraisalPeriod: set data.status = "Closed"
// - For "activate" appraisalPeriod: set data.status = "Set KPIs" and data.active = true
// - For dates, always use YYYY-MM-DD or ISO datetime format
// - announcements default announcementType = "all"
// - "create employee" / "add employee" / "invite employee" / "hire staff" → action="create", entity="employee"
// - For create employee: extract firstName, lastName, email, department, designation, employmentType, employmentStartDate, phoneNumber, gender, dateOfBirth, salaryScale wherever mentioned
// - For create meeting: ALWAYS extract invitedGuests from "meeting with [Name]" or "schedule with [Name]" — set data.invitedGuests = [{"employeeName": "Name"}] (or [{"employeeName": "Name1"}, {"employeeName": "Name2"}] for multiple). Also extract meetingStartTime, meetingEndTime (ISO format), location (Online or Offline), title. If guest name appears in the message, put it in data.invitedGuests — never leave it empty when a name is mentioned.
// - If you cannot determine a field, set it to null
// - confidence should reflect how clearly the user's intent was expressed`;

// /**
//  * Calls Groq to extract a structured mutation from natural language.
//  * @param {string} message - raw user message
//  * @param {object} quick - { action, entity } from quickDetect (hint for LLM)
//  * @returns {Promise<object|null>} parsed mutation object or null on failure
//  */
// async function extractMutation(message, quick = null) {
//   const hint = quick
//     ? `The user appears to want to: ${quick.action} a ${quick.entity}.\n\n`
//     : '';

//   try {
//     const completion = await groq.chat.completions.create({
//       model: MUTATION_MODEL,
//       messages: [
//         { role: 'system', content: EXTRACT_SYSTEM_PROMPT },
//         { role: 'user', content: `${hint}User message: "${message}"` },
//       ],
//       max_tokens: 512,
//       temperature: 0.1,
//     });

//     const raw = completion.choices[0].message.content.trim();

//     // Strip markdown code fences if LLM wraps the JSON
//     let jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

//     // Extract outermost object in case of extra text before/after
//     const match = jsonStr.match(/\{[\s\S]*\}/);
//     if (match) jsonStr = match[0];

//     let parsed;
//     try {
//       parsed = JSON.parse(jsonStr);
//     } catch (parseErr) {
//       let repaired = jsonStr.replace(/\r\n|\r|\n/g, ' ').replace(/,(\s*[}\]])/g, '$1');
//       try {
//         parsed = JSON.parse(repaired);
//       } catch (e2) {
//         let jsonRepair;
//         try { jsonRepair = require('jsonrepair'); } catch (_) {}
//         if (jsonRepair) {
//           try { parsed = JSON.parse(jsonRepair(jsonStr)); } catch (_) {}
//         }
//         if (!parsed) {
//           console.error('[mutationBuilder] extractMutation error:', parseErr.message, '| raw length:', raw.length);
//           return null;
//         }
//       }
//     }

//     return parsed;
//   } catch (err) {
//     console.error('[mutationBuilder] extractMutation error:', err.message);
//     return null;
//   }
// }

// module.exports = { isMutationIntent, quickDetect, extractMutation };

/**
 * Mutation Builder
 * Uses Groq (LLM) to parse a natural-language HR mutation request into a
 * structured action object that mutationExecutor.js can run against MongoDB.
 *
 * TOKEN BUDGET STRATEGY (from console.groq.com/settings/limits):
 *
 *  Model                           TPM    TPD    RPD    Use
 *  llama-3.1-8b-instant            6K     500K   14.4K  Simple (approve/reject/delete)
 *  meta-llama/llama-4-scout-...    30K    500K   1K     Complex (create/update many fields)
 *  openai/gpt-oss-120b             8K     200K   1K     Complex fallback
 *  llama-3.3-70b-versatile         12K    100K   1K     Quality fallback (last resort)
 *
 *  Each mutation call costs ~600-900 tokens (prompt + response).
 *  Budget: ~833 simple + ~555 complex = ~1,400 mutations/day on free tier.
 *  For production with multiple companies, upgrade to Groq Developer plan.
 *
 * ROUTING:
 *  SIMPLE tier — approve, reject, delete (just need action+entity+name)
 *    → llama-3.1-8b-instant (500K/day) → openai/gpt-oss-120b fallback
 *  COMPLEX tier — create employee/meeting, multi-field update, any with many data fields
 *    → meta-llama/llama-4-scout-17b-16e-instruct (500K/day, 30K TPM) → gpt-oss-120b fallback
 */

const OpenAI = require('openai');

const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey:  process.env.GROQ_API_KEY,
});

// ─── Model tiers (token-budget aware) ────────────────────────────────────────
//
// SIMPLE tier — approve/reject/delete: just need action + entity + employee name.
//   Prompt is short (~400 tokens), response is short (~200 tokens) = ~600/call.
//   llama-3.1-8b-instant:  500K tokens/day → ~833 simple mutations/day  ← primary
//   openai/gpt-oss-120b:   200K tokens/day → ~333 as fallback
//
// COMPLEX tier — create (employee/meeting), multi-field update: extracts 10+ fields.
//   Prompt is larger (~500 tokens), response is larger (~400 tokens) = ~900/call.
//   meta-llama/llama-4-scout-17b-16e-instruct: 500K/day, 30K TPM → ~555/day  ← primary
//   openai/gpt-oss-120b:  200K/day → ~222 as fallback
//   llama-3.3-70b-versatile: 100K/day → ~111 as last resort (quality guarantee)
//
// Combined budget: ~1,400 mutations/day free tier.
// With 10 companies × 20 employees × 5 copilot uses/day = 1,000/day — fits on free tier.
// Upgrade to Groq Developer plan when you exceed this.

const MODELS = {
  // 1. groq/compound-mini — 250 req/day, NO token limit, 70K TPM
  //    Groq's own router, auto-picks best underlying model. Primary.
  COMPOUND:      'groq/compound-mini',

  // 2. llama-3.3-70b-versatile — 1K req/day, 100K tokens/day, 12K TPM
  //    Best open model for instruction following + JSON extraction quality.
  //    Catches whatever compound misses before dropping to high-volume models.
  QUALITY:       'llama-3.3-70b-versatile',

  // 3. llama-3.1-8b-instant — 14,400 req/day, 500K tokens/day, 6K TPM
  //    High-volume workhorse. Lower quality but handles the bulk of load
  //    once compound (250) and 70b (1K) daily quotas are exhausted.
  HIGH_VOLUME:   'llama-3.1-8b-instant',

  // 4. openai/gpt-oss-120b — 1K req/day, 200K tokens/day
  //    Last resort safety net.
  LAST_RESORT:   'openai/gpt-oss-120b',
};

// 512 was causing truncation -> "Expected ',' or '}' at position 230"
// Our prompt + JSON response needs ~700-900 tokens. 1024 gives enough headroom.
const MAX_TOKENS = 1024;

// Models that support response_format: json_object on Groq
// openai/gpt-oss-120b does NOT support it — prompt-only enforcement used instead
// groq/compound-mini routes internally so json_object works end-to-end
const JSON_MODE_SUPPORTED = new Set([
  'groq/compound-mini',
  'groq/compound',
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
]);

/**
 * Model fallback chain — ordered by quality, with volume safety net at the end.
 *
 * Chain: compound-mini → llama-3.3-70b-versatile → llama-3.1-8b-instant → gpt-oss-120b
 *
 * Daily capacity:
 *   compound-mini:          250 req  (no token limit)
 *   llama-3.3-70b-versatile: 1K req  (100K tokens)
 *   llama-3.1-8b-instant:  14.4K req (500K tokens)  ← volume safety net
 *   openai/gpt-oss-120b:    1K req  (200K tokens)
 *   Total: ~16,650 mutations/day on free tier
 *
 * Each 429 (rate limit) automatically falls to the next model in the chain.
 */
function selectModelChain() {
  return [
    MODELS.COMPOUND,     // 250 req/day, no token limit — primary
    MODELS.QUALITY,      // 1K req/day, best open model — quality fallback
    MODELS.HIGH_VOLUME,  // 14.4K req/day — high-volume workhorse
    MODELS.LAST_RESORT,  // 1K req/day — final safety net
  ];
}

// ─── Keyword detection (fast, no LLM cost) ────────────────────────────────────

const MUTATION_KEYWORDS = {
  approve: ['approve', 'accept', 'grant', 'authorise', 'authorize'],
  reject:  ['reject', 'decline', 'deny', 'disapprove', 'refuse'],
  create:  ['create', 'add', 'submit', 'apply for', 'request', 'raise', 'file', 'book',
             'invite', 'hire', 'onboard', 'register', 'new employee', 'new staff', 'schedule'],
  update:  ['update', 'change', 'edit', 'modify', 'set', 'mark', 'move', 'transfer'],
  delete:  ['delete', 'remove', 'cancel'],
};

const ENTITY_KEYWORDS = {
  leave:           ['leave', 'absence', 'time off', 'day off', 'vacation', 'sick leave', 'annual leave'],
  expense:         ['expense', 'claim', 'reimbursement', 'spend', 'purchase'],
  appraisal:       ['appraisal request', 'appraisal review', 'performance review'],
  appraisalPeriod: ['appraisal period', 'review period', 'performance period', 'appraisal cycle'],
  kpi:             ['kpi', 'key performance', 'performance indicator'],
  employee:        ['employee', 'staff', 'worker', 'hire', 'onboard', 'new hire', 'profile', 'department', 'designation'],
  meeting:         ['meeting', 'schedule meeting', 'team meeting', 'standup'],
  department:      ['department'],
  branch:          ['branch', 'office', 'location'],
  designation:     ['designation', 'job title', 'position'],
  holiday:         ['holiday', 'public holiday'],
  announcement:    ['announcement', 'notice', 'notice board'],
};

// Question patterns: do not treat as mutation (e.g. "Who has the most pending expense requests?")
const QUESTION_STARTS = /^\s*(who|what|which|how\s+many|how\s+much|list|show\s+me|tell\s+me|get\s+me|which\s+employee|who\s+has|who\s+had|who\s+is|what\s+are|how\s+many)\b/i;
const QUESTION_PATTERNS = /\b(who\s+has|who\s+had|how\s+many|which\s+employee|list\s+all|show\s+me\s+the)\b/i;

function isLikelyQuestion(message) {
  const t = (message || '').trim();
  return QUESTION_STARTS.test(t) || QUESTION_PATTERNS.test(t);
}

function isMutationIntent(message) {
  const lower = (message || '').toLowerCase();
  if (isLikelyQuestion(lower)) return false;
  return Object.values(MUTATION_KEYWORDS).some(kws => kws.some(kw => lower.includes(kw)));
}

function quickDetect(message) {
  const lower = message.toLowerCase();
  let action = null;
  let entity = null;
  for (const [act, kws] of Object.entries(MUTATION_KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) { action = act; break; }
  }
  for (const [ent, kws] of Object.entries(ENTITY_KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) { entity = ent; break; }
  }
  return action && entity ? { action, entity } : null;
}

// ─── System prompt ────────────────────────────────────────────────────────────

const EXTRACT_SYSTEM_PROMPT = `You are a JSON extraction assistant for an HR system.
Extract a structured mutation from the user's natural-language HR command.

Return ONLY valid JSON — no explanation, no markdown, no code fences.

Schema:
{
  "action": "approve" | "reject" | "create" | "update" | "delete" | "close" | "activate",
  "entity": "leave" | "expense" | "appraisal" | "appraisalPeriod" | "kpi" | "employee" | "meeting" | "department" | "branch" | "designation" | "holiday" | "announcement",
  "filters": {
    "employeeName": string or null,
    "employeeId": string or null,
    "recordId": string or null,
    "status": string or null,
    "leaveType": string or null,
    "periodName": string or null,
    "name": string or null
  },
  "data": {
    "status": string or null,
    "comment": string or null,
    "leaveTypeName": string or null,
    "leaveStartDate": "YYYY-MM-DD" or null,
    "leaveEndDate": "YYYY-MM-DD" or null,
    "reason": string or null,
    "amount": number or null,
    "expenseTypeName": string or null,
    "expenseDate": "YYYY-MM-DD" or null,
    "description": string or null,
    "firstName": string or null,
    "lastName": string or null,
    "email": string or null,
    "phoneNumber": string or null,
    "gender": "Male" | "Female" | "Other" or null,
    "dateOfBirth": "YYYY-MM-DD" or null,
    "department": string or null,
    "designation": string or null,
    "employmentType": "Full-time" | "Part-time" | "Contract" | "Intern" or null,
    "employmentStartDate": "YYYY-MM-DD" or null,
    "companyRole": string or null,
    "title": string or null,
    "content": string or null,
    "meetingStartTime": "ISO datetime" or null,
    "meetingEndTime": "ISO datetime" or null,
    "location": "Online" | "Offline" or null,
    "invitedGuests": [{"employeeName": "string"}] or null,
    "departmentName": string or null,
    "branchName": string or null,
    "branchCode": string or null,
    "branchManagerName": string or null,
    "branchAdminName": string or null,
    "designationName": string or null,
    "grade": number or null,
    "holidayName": string or null,
    "date": "YYYY-MM-DD" or null,
    "appraisalPeriodName": string or null,
    "startDate": "YYYY-MM-DD" or null,
    "endDate": "YYYY-MM-DD" or null,
    "kpiName": string or null,
    "kpiDescription": string or null,
    "weight": number or null,
    "target": number or null,
    "managerName": string or null,
    "managerId": string or null
  },
  "confidence": 0.0
}

Rules:
- For "approve": set data.status = "Approved"
- For "reject": set data.status = "Declined"
- For "close" appraisalPeriod: set data.status = "Closed"
- For "activate" appraisalPeriod: set data.status = "Set KPIs"
- Always use YYYY-MM-DD for dates, ISO 8601 for datetimes
- For meeting requests: extract invitedGuests from "meeting with [Name]". Set data.invitedGuests = [{"employeeName": "Name"}]
- For "update employee department": action="update", entity="employee", data.department = "DepartmentName", filters.employeeName = "EmployeeName"
- For "update employee designation": action="update", entity="employee", data.designation = "DesignationName"
- For "update employee start date" / "change start date to DD/MM/YYYY": action="update", entity="employee", data.startDate = the date (use DD/MM/YYYY or YYYY-MM-DD), filters.employeeName = "Employee Full Name"
- For "update branch" / "set branch manager" / "set branch admin": action="update", entity="branch". Use filters.name or filters.recordId for branch; data.branchManagerName = manager employee name, data.branchAdminName = admin employee name
- Set unknown fields to null — never omit them
- confidence: 0.9 if clear, 0.6 if partially clear, 0.3 if guessing`;

// ─── JSON repair helpers ──────────────────────────────────────────────────────

/**
 * Attempt to recover truncated JSON by closing open brackets/braces.
 * This handles the most common case: max_tokens cuts the stream mid-JSON.
 */
function repairTruncatedJson(str) {
  // Count open vs closed braces/brackets
  let braces   = 0;
  let brackets = 0;
  let inString = false;
  let escape   = false;

  for (const ch of str) {
    if (escape)       { escape = false; continue; }
    if (ch === '\\')  { escape = true;  continue; }
    if (ch === '"')   { inString = !inString; continue; }
    if (inString)     continue;
    if (ch === '{')   braces++;
    if (ch === '}')   braces--;
    if (ch === '[')   brackets++;
    if (ch === ']')   brackets--;
  }

  // Remove trailing incomplete token (e.g. cut-off string or key)
  let repaired = str.trimEnd();

  // Strip trailing incomplete string or key-value pair
  repaired = repaired.replace(/,?\s*"[^"]*$/, '');          // trailing open string
  repaired = repaired.replace(/,?\s*"[^"]+"\s*:\s*$/, '');  // trailing key with no value
  repaired = repaired.replace(/,\s*$/, '');                  // trailing comma

  // Close any open arrays then objects
  repaired += ']'.repeat(Math.max(0, brackets));
  repaired += '}'.repeat(Math.max(0, braces));

  return repaired;
}

/**
 * Full repair pipeline: try in order until we get valid JSON.
 */
function parseWithRepair(raw) {
  // 1. Strip markdown fences
  let str = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  // 2. Extract outermost JSON object
  const objMatch = str.match(/\{[\s\S]*\}/);
  if (objMatch) str = objMatch[0];

  // 3. Try direct parse
  try { return JSON.parse(str); } catch (_) {}

  // 4. Fix trailing commas and parse again
  const noTrailing = str.replace(/,(\s*[}\]])/g, '$1');
  try { return JSON.parse(noTrailing); } catch (_) {}

  // 5. Repair truncation (most likely cause of "position 230" errors)
  const truncFixed = repairTruncatedJson(noTrailing);
  try { return JSON.parse(truncFixed); } catch (_) {}

  // 6. jsonrepair library (handles many more edge cases)
  try {
    const { jsonrepair } = require('jsonrepair');
    return JSON.parse(jsonrepair(str));
  } catch (_) {}

  // 7. Try jsonrepair on the truncation-fixed version
  try {
    const { jsonrepair } = require('jsonrepair');
    return JSON.parse(jsonrepair(truncFixed));
  } catch (_) {}

  return null;
}

// ─── LLM extraction ───────────────────────────────────────────────────────────

async function callGroq(message, quick, model) {
  const hint = quick ? `The user wants to: ${quick.action} a ${quick.entity}.\n\n` : '';

  // Only pass response_format for models that support it on Groq.
  // openai/gpt-oss-120b does not support json_object mode — omit it to avoid API errors.
  const supportsJsonMode = JSON_MODE_SUPPORTED.has(model);

  const params = {
    model,
    messages: [
      { role: 'system', content: EXTRACT_SYSTEM_PROMPT },
      { role: 'user',   content: `${hint}User message: "${message}"` },
    ],
    max_tokens:  MAX_TOKENS,
    temperature: 0.1,
  };

  if (supportsJsonMode) {
    params.response_format = { type: 'json_object' };
  }

  const completion = await groq.chat.completions.create(params);

  const raw        = completion.choices[0].message.content.trim();
  const stopReason = completion.choices[0].finish_reason;

  if (stopReason === 'length') {
    console.warn(`[mutationBuilder] Model ${model} truncated response — will attempt repair. Consider raising MAX_TOKENS.`);
  }

  return raw;
}

/**
 * Calls Groq to extract a structured mutation from natural language.
 * @param {string} message - raw user message
 * @param {object} quick - { action, entity } hint from quickDetect
 * @returns {Promise<object|null>}
 */
async function extractMutation(message, quick = null) {
  let raw = null;

  // Model fallback chain: primary → fallback → fast fallback
  // Each model is tried in order; move to next on error (rate limit, model unavailable, etc.)
  const modelChain = selectModelChain(); // compound-mini primary, llama fallback chain
  let lastErr = null;

  for (const model of modelChain) {
    try {
      raw = await callGroq(message, quick, model);
      if (raw) break; // success
    } catch (err) {
      lastErr = err;
      console.warn(`[mutationBuilder] Model ${model} failed: ${err.message}`);
    }
  }

  if (!raw) {
    console.error('[mutationBuilder] All models failed. Last error:', lastErr?.message);
    return null;
  }

  const parsed = parseWithRepair(raw);

  if (!parsed) {
    console.error(
      `[mutationBuilder] extractMutation: all repair attempts failed.\n` +
      `  raw length: ${raw.length}\n` +
      `  raw preview: ${raw.slice(0, 300)}`
    );
    return null;
  }

  // Validate required top-level fields
  if (!parsed.action || !parsed.entity) {
    console.warn('[mutationBuilder] Parsed object missing action or entity:', JSON.stringify(parsed).slice(0, 200));
    return null;
  }

  // Ensure filters and data exist as objects
  parsed.filters = parsed.filters || {};
  parsed.data    = parsed.data    || {};

  return parsed;
}

module.exports = { isMutationIntent, isLikelyQuestion, quickDetect, extractMutation };