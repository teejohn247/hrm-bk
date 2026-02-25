// const express = require('express');
// const router = express.Router();
// import dotenv from 'dotenv';

// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { detectIntent } from '../controller/Copilot/intentDetector';
// import { buildMongoQuery } from '../controller/Copilot/queryBuilder';
// import { fetchHRData, fetchEmployeeById, resolveCopilotContext } from '../controller/Copilot/dataFetcher';
// import { formatContextForGemini } from '../controller/Copilot/contextFormatter';

// dotenv.config();

// // ─── Initialise Gemini ───────────────────────────────────────────────────────
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /**
//  * Returns a Gemini model instance.
//  * model: 'gemini-2.0-flash'  ← free tier, fast, great for HR queries
//  */
// function getModel(systemPrompt) {
//   return genAI.getGenerativeModel({
//     model: 'gemini-2.5-flash',
//     systemInstruction: systemPrompt,
//   });
// }

// // ─── Routes ──────────────────────────────────────────────────────────────────

// /**
//  * POST /api/copilot/chat
//  * Main HR Copilot chat endpoint
//  *
//  * Body:
//  * {
//  *   message: string,
//  *   conversationHistory: [],
//  *   companyId?: string,   // If provided → userRole = super_admin
//  *   userId?: string,      // If companyId not provided → resolve companyId from user
//  *   userRole: string      // 'admin' | 'manager' | 'employee' (when using userId)
//  * }
//  * Requires either companyId or userId.
//  */
// router.post('/chat', async (req, res) => {
//   try {
//     const {
//       message,
//       conversationHistory = [],
//       companyId,
//       userId,
//       userRole = 'admin',
//       conversationId,
//     } = req.body;

//     if (!message) {
//       return res.status(400).json({ error: 'message is required' });
//     }
//     if (!companyId && !userId) {
//       return res.status(400).json({
//         error: 'Either companyId or userId is required',
//       });
//     }

//     const ctx = await resolveCopilotContext(companyId, userId, userRole);
//     if (!ctx) {
//       return res.status(400).json({ error: 'Could not resolve company context from userId' });
//     }

//     // Step 1: Detect what module/intent the user is asking about
//     const intent = await detectIntent(message);

//     // Step 2: Build and execute the appropriate MongoDB query
//     const mongoQuery = buildMongoQuery(intent, ctx.companyId, ctx.userId, ctx.userRole);
//     const hrData = await fetchHRData(intent, mongoQuery);

//     // Step 3: Format data as context for Gemini
//     const dataContext = formatContextForGemini(intent, hrData);

//     // Step 4: Build system prompt and Gemini chat history
//     const systemPrompt = buildSystemPrompt(ctx.userRole);
//     const history = buildGeminiHistory(conversationHistory);

//     // Step 5: Call Gemini API
//     const model = getModel(systemPrompt);
//     const chat = model.startChat({ history });

//     // Inject HR data context into the user's message
//     const userContent = dataContext
//       ? `${message}\n\n---\n[HR Data Context for this query:]\n${dataContext}`
//       : message;

//     const result = await chat.sendMessage(userContent);
//     const reply = result.response.text();

//     return res.json({
//       reply,
//       intent,
//       sources: hrData.sources || [],
//       conversationId: conversationId || generateId(),
//     });

//   } catch (error) {
//     console.error('HR Copilot error:', error);
//     return res.status(500).json({
//       error: 'Something went wrong. Please try again.',
//       details: error.message,
//     });
//   }
// });

// /**
//  * POST /api/copilot/generate-document
//  * Generates professional HR documents for a specific employee
//  *
//  * Body:
//  * {
//  *   documentType: 'offer_letter' | 'warning_letter' | 'termination_letter' | 'promotion_letter',
//  *   employeeId: string,
//  *   companyId?: string,   // If provided → super_admin scope
//  *   userId?: string,      // If companyId not provided → resolve from user
//  *   userRole: string,
//  *   additionalContext: {}
//  * }
//  * Requires either companyId or userId.
//  */
// router.post('/generate-document', async (req, res) => {
//   try {
//     const {
//       documentType,
//       employeeId,
//       companyId,
//       userId,
//       userRole = 'admin',
//       additionalContext = {},
//     } = req.body;

//     if (!documentType || !employeeId) {
//       return res.status(400).json({
//         error: 'documentType and employeeId are required',
//       });
//     }
//     if (!companyId && !userId) {
//       return res.status(400).json({
//         error: 'Either companyId or userId is required',
//       });
//     }

//     const ctx = await resolveCopilotContext(companyId, userId, userRole);
//     if (!ctx) {
//       return res.status(400).json({ error: 'Could not resolve company context from userId' });
//     }

//     // Fetch the employee record
//     const employee = await fetchEmployeeById(employeeId, ctx.companyId);
//     if (!employee) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }

//     const docSystemPrompt = `You are an HR document specialist for a Nigerian company.
// Generate professional, formally worded HR documents.
// Always include all employee details provided.
// Format with clear sections and proper spacing.
// Use Nigerian Naira (₦) for all monetary references.`;

//     const prompt = buildDocumentPrompt(documentType, employee, additionalContext);

//     const model = getModel(docSystemPrompt);
//     const result = await model.generateContent(prompt);
//     const document = result.response.text();

//     return res.json({
//       document,
//       employeeName: `${employee.firstName} ${employee.lastName}`,
//       documentType,
//       generatedAt: new Date().toISOString(),
//     });

//   } catch (error) {
//     console.error('Document generation error:', error);
//     return res.status(500).json({ error: 'Failed to generate document' });
//   }
// });

// /**
//  * POST /api/copilot/summarise
//  * Generates an AI summary of any HR data snapshot (dashboard widget)
//  *
//  * Body: { companyId?, userId?, userRole }
//  * Requires either companyId or userId. If companyId → userRole = super_admin.
//  */
// router.post('/summarise', async (req, res) => {
//   try {
//     const { companyId, userId, userRole = 'admin' } = req.body;

//     if (!companyId && !userId) {
//       return res.status(400).json({ error: 'Either companyId or userId is required' });
//     }

//     const ctx = await resolveCopilotContext(companyId, userId, userRole);
//     if (!ctx) {
//       return res.status(400).json({ error: 'Could not resolve company context from userId' });
//     }

//     // Fetch a general snapshot across all modules
//     const generalIntent = { primary: 'general', secondary: [], filters: {} };
//     const mongoQuery = buildMongoQuery(generalIntent, ctx.companyId, ctx.userId, ctx.userRole);
//     const hrData = await fetchHRData(generalIntent, mongoQuery);
//     const dataContext = formatContextForGemini(generalIntent, hrData);

//     const model = getModel(buildSystemPrompt(ctx.userRole));
//     const result = await model.generateContent(
//       `Based on the following HR data, write a concise 3–5 sentence executive summary 
//        highlighting the most important things an HR admin should know right now. 
//        Flag anything urgent (pending approvals, anomalies, upcoming events).\n\n${dataContext}`
//     );

//     return res.json({
//       summary: result.response.text(),
//       generatedAt: new Date().toISOString(),
//     });

//   } catch (error) {
//     console.error('Summarise error:', error);
//     return res.status(500).json({ error: 'Failed to generate summary' });
//   }
// });

// /**
//  * GET /api/copilot/suggestions?companyId=xxx
//  * Returns suggested questions to display in the chat UI
//  */
// router.get('/suggestions', async (req, res) => {
//   try {
//     const suggestions = [
//       "Which employees haven't had a performance review this quarter?",
//       "Show me the payroll summary for this month",
//       "Who has the most pending expense requests?",
//       "Which department has the highest absence rate?",
//       "Draft an offer letter for a new Sales Manager",
//       "Which employees have work anniversaries this month?",
//       "Flag any payroll anomalies from last month",
//       "Who are the top performers based on appraisal scores?",
//       "List all employees currently on leave",
//       "How much have we spent on expenses this year?",
//     ];

//     return res.json({ suggestions });
//   } catch (error) {
//     return res.status(500).json({ error: 'Failed to fetch suggestions' });
//   }
// });

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function buildSystemPrompt(userRole) {
//   const roleContext = {
//     admin:      'You have full access to all HR data across the organization.',
//     manager:    'You can see data for your direct reports and department only.',
//     employee:   'You can only see your own personal HR data.',
//     super_admin:'You have full access to all HR data and system settings.',
//   };

//   return `You are an intelligent HR Copilot assistant for a Nigerian company using a modern HR management system.
// You help HR professionals, managers, and employees get instant answers about employees, payroll,
// absences, expenses, appraisals, and learning management.

// Current user role: ${userRole}. ${roleContext[userRole] || ''}

// Guidelines:
// - Be concise and direct. Lead with the answer, then provide supporting details.
// - Use Nigerian Naira (₦ or NGN) for all monetary references.
// - If you don't have enough data to answer confidently, say so clearly — never make up employee data.
// - For sensitive information (salaries, performance scores), remind users of confidentiality where relevant.
// - If asked to draft a document, produce a complete and professional draft immediately.
// - Format lists and tables clearly when presenting multiple records.
// - Today's date is ${new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`;
// }

// /**
//  * Converts our internal conversationHistory format to Gemini's expected format.
//  * Gemini uses: [{ role: 'user'|'model', parts: [{ text }] }]
//  */
// function buildGeminiHistory(conversationHistory) {
//   const recent = conversationHistory.slice(-10); // Keep last 10 turns
//   return recent.map((turn) => ({
//     role: turn.role === 'assistant' ? 'model' : 'user',
//     parts: [{ text: turn.content }],
//   }));
// }

// function buildDocumentPrompt(documentType, employee, additionalContext) {
//   const today = new Date().toLocaleDateString('en-NG', {
//     day: 'numeric', month: 'long', year: 'numeric',
//   });

//   const templates = {
//     offer_letter: `Generate a professional offer letter with the following details:
// Employee Name: ${employee.firstName} ${employee.lastName}
// Position: ${employee.designation}
// Department: ${employee.department?.name || employee.department}
// Employment Type: ${employee.jobType || 'Permanent'}
// Start Date: ${additionalContext.startDate || '[START DATE]'}
// Monthly Salary: ₦${additionalContext.salary || '[SALARY]'}
// Date: ${today}
// ${additionalContext.notes ? `Additional Notes: ${additionalContext.notes}` : ''}`,

//     warning_letter: `Generate a formal written warning letter with the following details:
// Employee Name: ${employee.firstName} ${employee.lastName}
// Department: ${employee.department?.name || employee.department}
// Nature of Issue: ${additionalContext.issue || '[DESCRIBE ISSUE]'}
// Date of Incident: ${additionalContext.incidentDate || '[DATE OF INCIDENT]'}
// Date: ${today}
// ${additionalContext.notes ? `Additional Context: ${additionalContext.notes}` : ''}`,

//     termination_letter: `Generate a professional employment termination letter with the following details:
// Employee Name: ${employee.firstName} ${employee.lastName}
// Department: ${employee.department?.name || employee.department}
// Last Working Day: ${additionalContext.lastDay || '[LAST WORKING DAY]'}
// Reason for Termination: ${additionalContext.reason || '[REASON]'}
// Date: ${today}
// ${additionalContext.notes ? `Additional Notes: ${additionalContext.notes}` : ''}`,

//     promotion_letter: `Generate a promotion congratulations letter with the following details:
// Employee Name: ${employee.firstName} ${employee.lastName}
// Current Role: ${employee.designation}
// New Role: ${additionalContext.newRole || '[NEW ROLE]'}
// New Monthly Salary: ₦${additionalContext.newSalary || '[NEW SALARY]'}
// Effective Date: ${additionalContext.effectiveDate || '[EFFECTIVE DATE]'}
// Date: ${today}
// ${additionalContext.notes ? `Additional Notes: ${additionalContext.notes}` : ''}`,
//   };

//   return (
//     templates[documentType] ||
//     `Generate a ${documentType} HR document for ${employee.firstName} ${employee.lastName}. 
//      Additional context: ${JSON.stringify(additionalContext)}`
//   );
// }

// function generateId() {
//   return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// }

// module.exports = router;

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
import { detectIntent } from '../controller/Copilot/intentDetector';
import { buildMongoQuery } from '../controller/Copilot/queryBuilder';
import { fetchHRData, fetchEmployeeById, fetchCompanyById, fetchSalaryScales, fetchReportForCsv, resolveCopilotContext } from '../controller/Copilot/dataFetcher';
import { formatContextForGemini, formatMutationResult } from '../controller/Copilot/contextFormatter';
import { isMutationIntent, quickDetect, extractMutation } from '../controller/Copilot/mutationBuilder';
import { executeMutation } from '../controller/Copilot/mutationExecutor';

// ─── Initialise Groq (uses OpenAI-compatible SDK) ────────────────────────────
const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Groq free models (Feb 2026):
 * 'llama-3.3-70b-versatile'  ← best quality, recommended ✅
 * 'llama-3.1-8b-instant'     ← ultra fast, use for simple lookups
 * 'mixtral-8x7b-32768'       ← large 32k context window
 * 'gemma2-9b-it'             ← Google's open model, also free on Groq
 *
 * Free limits: 14,400 req/day, 30 req/min — very generous
 */
const GROQ_MODEL = 'llama-3.1-8b-instant';

/** Parse employment start date (DD-MM-YYYY or YYYY-MM-DD) to { month: 1-12, year }. */
function parseStartDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  const parts = s.split(/[-/]/).map(p => parseInt(p, 10)).filter(n => !isNaN(n));
  if (parts.length !== 3) return null;
  let month, year;
  if (parts[2] >= 1900 && parts[2] <= 2100) {
    year = parts[2];
    if (parts[0] > 12) {
      month = parts[1];
    } else if (parts[1] > 12) {
      month = parts[0];
    } else {
      month = parts[1];
    }
  } else {
    year = parts[0];
    month = parts[1];
  }
  if (month < 1 || month > 12) return null;
  return { month, year };
}

/** Keep only employees whose work anniversary falls in refMonth/refYear (started in same month, earlier year). */
function filterEmployeesWithAnniversaryThisMonth(employees, refDate = new Date()) {
  if (!employees?.length) return employees;
  const refMonth = refDate.getMonth() + 1;
  const refYear = refDate.getFullYear();
  return employees.filter(emp => {
    const start = parseStartDate(emp.employmentStartDate || emp.startDate);
    if (!start) return false;
    return start.month === refMonth && start.year < refYear;
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/copilot/chat
 * Main HR Copilot chat endpoint
 *
 * Body:
 * {
 *   message: string
 *   conversationHistory: []
 *   organizationId: string   (or companyId — both accepted)
 *   userId: string
 *   userRole: 'admin' | 'manager' | 'employee'
 * }
 */
router.post('/chat', async (req, res) => {
  try {
    const {
      message,
      conversationHistory = [],
      organizationId,
      companyId,
      userId,
      userRole,
      conversationId,
    } = req.body;

    const rawCompanyId = organizationId || companyId;

    if (!message || (!rawCompanyId && !userId)) {
      return res.status(400).json({
        error: 'message and either companyId or userId are required',
      });
    }

    // Auto-resolve companyId + role from DB (uses isSuperAdmin / isManager)
    const context = await resolveCopilotContext(rawCompanyId, userId, userRole);
    if (!context) {
      return res.status(400).json({ error: 'Could not resolve company context from provided IDs' });
    }

    const { companyId: resolvedCompanyId, userId: resolvedUserId, userRole: resolvedRole } = context;

    // Fetch company for personalization (documents, setup, etc.)
    const company = await fetchCompanyById(resolvedCompanyId);
    const companyContext = company ? { companyName: company.companyName || company.email } : {};

    // ── Direct CSV download shortcut ──────────────────────────────────────────
    // When the user says "csv download", "yes csv", "download it" etc. after the bot
    // asked "sheet or summary?" — skip all pipelines and return the download URL directly.
    const isDirectDownload = /^(csv\s*download|download\s*(csv|it|report)|yes\s*(csv|download|sheet)|send\s*(csv|report)|get\s*(csv|report))$/i.test(message.trim())
      || (/\b(csv|download)\b/i.test(message) && message.trim().split(/\s+/).length <= 4);
    if (isDirectDownload) {
      const recentMsgs = (conversationHistory || []).slice(-6).map(m => m.content || '').join(' ').toLowerCase();
      let reportType = 'payroll';
      if (/leave|absence/.test(recentMsgs))             reportType = 'leave';
      else if (/expense/.test(recentMsgs))               reportType = 'expense';
      else if (/employee|staff|headcount/.test(recentMsgs)) reportType = 'employee';
      else if (/payroll|salary|pay/.test(recentMsgs))    reportType = 'payroll';
      const labels = { payroll: 'Payroll', leave: 'Leave', expense: 'Expense', employee: 'Employee' };
      const downloadUrl   = `/api/copilot/reports/csv?companyId=${resolvedCompanyId}&type=${reportType}`;
      const downloadLabel = `Download ${labels[reportType]} CSV`;
      return res.json({
        reply: `Your ${labels[reportType]} report is ready. Click the '${downloadLabel}' button below to download it.`,
        downloadUrl,
        downloadLabel,
        conversationId: conversationId || generateId(),
        model:    GROQ_MODEL,
        resolvedRole,
      });
    }

    // ── Mutation pipeline (create / update / approve / reject / delete) ────────
    // Also handle follow-up replies where the user is answering clarifying questions
    // (e.g. "employment type is permanent") — those lack mutation keywords but are
    // continuations of a mutation started in a previous turn.
    const mutationContinuation = !isMutationIntent(message) && detectMutationContinuation(conversationHistory, message);
    if (isMutationIntent(message) || mutationContinuation) {
      // For continuations, combine recent conversation with current message so the LLM
      // can extract a complete mutation from all the details given across turns.
      const extractionInput = mutationContinuation
        ? buildConversationContext(conversationHistory, message)
        : message;

      const quick    = mutationContinuation
        ? detectQuickFromHistory(conversationHistory)
        : quickDetect(message);
      const mutation = await extractMutation(extractionInput, quick);

      if (mutation && mutation.action && mutation.entity) {
        const result = await executeMutation(mutation, {
          companyId: resolvedCompanyId,
          userId:    resolvedUserId,
          userRole:  resolvedRole,
        });

        // If the mutation FAILED, return the exact error directly — do NOT let the LLM
        // rephrase it, as it tends to hallucinate a different reason (e.g. "not found").
        if (!result.ok) {
          let reply = result.error || 'The action could not be completed. Please check the details and try again.';

          // When payroll period fails due to invalid salary config, list employees + available scales
          if (result.invalidEmployees?.length && mutation.entity === 'payrollPeriod') {
            const employees = result.invalidEmployees.map(e =>
              `• ${e.fullName || e.employeeName || 'Unknown'} (${e.department || 'N/A'}) – ${(e.issues || []).join(', ')}`
            ).join('\n');
            let scales = [];
            try { scales = await fetchSalaryScales(resolvedCompanyId); } catch (_) {}
            let scaleList = '';
            if (scales?.length > 0) {
              scaleList = scales.map(s =>
                `**${s.name}**: ${(s.levels || []).map(l => l.levelName).join(', ')}`
              ).join('\n');
              reply += `\n\n**Employees needing salary configuration:**\n${employees}\n\n**Available salary scales:**\n${scaleList}\n\nTo assign a salary scale, reply: *"Assign [Scale Name] level [Level Name] to [Employee Name]"*`;
            } else {
              reply += `\n\n**Employees needing salary configuration:**\n${employees}\n\nNo salary scales found. Create salary scales in HR Settings → Payroll first.`;
            }

            return res.json({
              reply,
              mutation: { action: mutation.action, entity: mutation.entity },
              result:   { ok: false, message: result.error, invalidEmployees: result.invalidEmployees },
              invalidEmployees: result.invalidEmployees,
              salaryScales: scales,
              conversationId: conversationId || generateId(),
              model:    GROQ_MODEL,
              resolvedRole,
            });
          }

          return res.json({
            reply,
            mutation: { action: mutation.action, entity: mutation.entity },
            result:   { ok: false, message: result.error },
            conversationId: conversationId || generateId(),
            model:    GROQ_MODEL,
            resolvedRole,
          });
        }

        // Success — let the AI narrate the outcome in natural language
        const outcomeText = formatMutationResult(result);
        const systemPrompt = buildSystemPrompt(resolvedRole, companyContext);
        const messages = buildMessages(
          systemPrompt, conversationHistory, message,
          `[Mutation outcome]\n${outcomeText}`
        );

        const completion = await groq.chat.completions.create({
          model:       GROQ_MODEL,
          messages,
          max_tokens:  512,
          temperature: 0.2,
        });

        const reply = completion.choices[0].message.content;

        return res.json({
          reply,
          mutation: { action: mutation.action, entity: mutation.entity },
          result:   { ok: result.ok, message: result.message, count: result.count },
          conversationId: conversationId || generateId(),
          model: GROQ_MODEL,
          resolvedRole,
        });
      }
    }

    // ── Read pipeline (default) ────────────────────────────────────────────────

    // Step 1: Detect which HR module the user is asking about
    const intent = await detectIntent(message);

    // Step 2: Build MongoDB query based on intent + resolved role
    const mongoQuery = buildMongoQuery(intent, resolvedCompanyId, resolvedUserId, resolvedRole);

    // Step 3: Fetch data from your MongoDB collections
    const hrData = await fetchHRData(intent, mongoQuery);

    // When user asks for "work anniversaries this month", filter to only employees whose start month = current month and start year < current year
    const isAnniversaryQuery = /\b(work\s+anniversar(y|ies)|anniversar(y|ies)\s+this\s+month)\b/i.test(message);
    if (isAnniversaryQuery && hrData.employees?.length > 0) {
      const now = new Date();
      hrData.employees = filterEmployeesWithAnniversaryThisMonth(hrData.employees, now);
      hrData._anniversaryMonthContext = `Current date: ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Only employees whose work anniversary falls this month (started in a previous year, same month) are listed below.`;
    }

    // Step 4: Format data into readable context text for the AI
    let dataContext = formatContextForGemini(intent, hrData);
    if (hrData._anniversaryMonthContext && dataContext) {
      dataContext = hrData._anniversaryMonthContext + '\n\n' + dataContext;
    }

    // Step 5: Build system prompt + full message array
    const systemPrompt = buildSystemPrompt(resolvedRole, companyContext);
    const messages = buildMessages(systemPrompt, conversationHistory, message, dataContext);

    // Step 6: Call Groq API
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.3,
    });

    const reply = completion.choices[0].message.content;

    const payload = {
      reply,
      intent,
      sources: hrData.sources || [],
      conversationId: conversationId || generateId(),
      model: GROQ_MODEL,
      resolvedRole,
    };

    // Include CSV download link when user asked for a report (sheet/table/csv) or when
    // the AI's reply mentions "Download CSV" / "comprehensive report" — so the link
    // is always available when a report-type response is given.
    const reportIntents = ['payroll', 'reports', 'absence', 'expenses', 'employees'];
    const isReportIntent = reportIntents.includes(intent.primary);
    const wantsSheet = /\b(sheet|table|csv|download|spreadsheet)\b/i.test(message);
    const replyMentionsDownload = /\bdownload\s*csv\b|comprehensive\s*report|click\s*['"]?download/i.test(reply);
    const recentMsgs = (conversationHistory || []).slice(-4).map(m => m.content || '').join(' ');
    const historyWantsSheet = /\b(sheet|table|csv|download|spreadsheet)\b/i.test(recentMsgs);

    if (isReportIntent && (wantsSheet || replyMentionsDownload || historyWantsSheet)) {
      let reportType = 'payroll';
      const combined = `${message} ${recentMsgs}`;
      if (/leave|absence/i.test(combined)) reportType = 'leave';
      else if (/expense/i.test(combined)) reportType = 'expense';
      else if (/employee|staff|headcount/i.test(combined)) reportType = 'employee';
      else if (/payroll|salary|pay/i.test(combined)) reportType = 'payroll';
      const labels = { payroll: 'Payroll', leave: 'Leave', expense: 'Expense', employee: 'Employee' };
      payload.downloadUrl = `/api/copilot/reports/csv?companyId=${resolvedCompanyId}&type=${reportType}`;
      payload.downloadLabel = `Download ${labels[reportType] || 'Report'} CSV`;
    }

    return res.json(payload);

  } catch (error) {
    console.error('HR Copilot error:', error?.message || error);
    return res.status(500).json({
      error: 'Something went wrong. Please try again.',
      details: error.message,
    });
  }
});

/**
 * POST /api/copilot/generate-document
 * Generates a professional HR document for a specific employee
 *
 * documentType: 'offer_letter' | 'warning_letter' | 'termination_letter' | 'promotion_letter'
 */
router.post('/generate-document', async (req, res) => {
  try {
    const {
      documentType,
      employeeId,
      organizationId,
      companyId,
      additionalContext = {},
    } = req.body;

    const orgId = organizationId || companyId;

    if (!documentType || !employeeId || !orgId) {
      return res.status(400).json({
        error: 'documentType, employeeId, and organizationId are required',
      });
    }

    const employee = await fetchEmployeeById(employeeId, orgId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const prompt = buildDocumentPrompt(documentType, employee, additionalContext);

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an HR document specialist for a Nigerian company.
Generate professional, formally worded HR documents.
Include all employee details provided.
Format with clear sections and proper spacing.
Use Nigerian Naira (₦) for all monetary references.`,
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0.2,
    });

    return res.json({
      document: completion.choices[0].message.content,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      documentType,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Document generation error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate document' });
  }
});

/**
 * POST /api/copilot/summarise
 * Generates an AI summary of the current HR data state
 * Use this to power the dashboard AI insights widget
 */
router.post('/summarise', async (req, res) => {
  try {
    const { organizationId, companyId, userId, userRole } = req.body;
    const rawCompanyId = organizationId || companyId;

    if (!rawCompanyId && !userId) {
      return res.status(400).json({ error: 'companyId or userId is required' });
    }

    const context = await resolveCopilotContext(rawCompanyId, userId, userRole);
    if (!context) {
      return res.status(400).json({ error: 'Could not resolve company context' });
    }

    const { companyId: resolvedCompanyId, userId: resolvedUserId, userRole: resolvedRole } = context;

    const generalIntent = { primary: 'general', secondary: [], filters: {} };
    const mongoQuery    = buildMongoQuery(generalIntent, resolvedCompanyId, resolvedUserId, resolvedRole);
    const hrData        = await fetchHRData(generalIntent, mongoQuery);
    const dataContext   = formatContextForGemini(generalIntent, hrData);

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(userRole) },
        {
          role: 'user',
          content: `Based on the following HR data, write a concise 3–5 sentence executive summary
highlighting the most important things the HR admin should know right now.
Flag anything urgent (pending approvals, anomalies, upcoming events). Use ₦ for all amounts.\n\n${dataContext}`,
        },
      ],
      max_tokens: 512,
      temperature: 0.3,
    });

    return res.json({
      summary: completion.choices[0].message.content,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Summarise error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
});

/**
 * GET /api/copilot/suggestions
 * Returns suggested questions to show in the chat UI
 */
router.get('/suggestions', (req, res) => {
  res.json({
    suggestions: [
      "How many employees do we have?",
      "Which employees haven't had a performance review this quarter?",
      "Show me the payroll summary for this month",
      "Who has the most pending expense requests?",
      "Which department has the highest absence rate?",
      "Draft an offer letter for a new Sales Manager",
      "Which employees have work anniversaries this month?",
      "List all employees currently on leave",
      "Flag any payroll anomalies from last month",
      "Who are the top performers based on appraisal scores?",
    ],
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the last assistant message was asking for missing mutation details.
 * Used to detect follow-up replies like "employment type is permanent".
 * Excludes report-generation flow (e.g. "generate the report", "just the report").
 */
function detectMutationContinuation(history, currentMessage) {
  if (!history || history.length === 0) return false;
  const msg = (currentMessage || '').toLowerCase();
  // Do NOT treat report requests as mutation continuations
  if (/\b(generate|give|show|get|send|create)\s*(the|me\s+)?(report|summary|sheet|csv|table)\b/i.test(msg)) return false;
  if (/^(yes|yeah|sure|ok|okay|please|just\s+(the\s+)?report)$/i.test(msg.trim())) return false;

  const lastAssistant = [...history].reverse().find(m => m.role === 'assistant');
  if (!lastAssistant) return false;
  const c = lastAssistant.content.toLowerCase();
  const askingForDetails = c.includes('i need') || c.includes('please provide')
    || c.includes('could you provide') || c.includes('missing') || c.includes('what is the')
    || c.includes('what are the') || c.includes('can you tell me');
  const mutationContext  = c.includes('create') || c.includes('update') || c.includes('add')
    || c.includes('employee') || c.includes('leave') || c.includes('expense')
    || c.includes('meeting') || c.includes('designation') || c.includes('department')
    || c.includes('employment type') || c.includes('start date') || c.includes('end date');
  return askingForDetails && mutationContext;
}

/**
 * Builds a combined conversation string (last 6 messages + current reply) so the
 * LLM can extract a complete mutation across multiple turns.
 */
function buildConversationContext(history, currentMessage) {
  const recent = history.slice(-6);
  const turns  = recent.map(m => `${m.role === 'assistant' ? 'assistant' : 'user'}: ${m.content}`).join('\n');
  return `${turns}\nuser: ${currentMessage}`;
}

/**
 * Scans recent history for the original mutation intent (action + entity).
 */
function detectQuickFromHistory(history) {
  for (const msg of [...history].reverse()) {
    if (msg.role === 'user' || msg.role === 'human') {
      const q = quickDetect(msg.content);
      if (q) return q;
    }
  }
  return null;
}

function buildSystemPrompt(userRole, companyContext = {}) {
  const roleContext = {
    admin:       'You have full access to all HR data across the organization.',
    manager:     'You can see data for your direct reports and department only.',
    employee:    'You can only see your own personal HR data.',
    super_admin: 'You have full access to all HR data and system settings.',
  };

  const companyName = companyContext.companyName || 'the company';
  const companyLine = companyContext.companyName
    ? `The user is logged in with: ${companyContext.companyName}. Use this company name for all documents and setup.`
    : '';

  return `You are an intelligent HR Copilot assistant for a Nigerian company using a modern HR management system.
All data you see is scoped to the user's company only. Every search and list is filtered by companyId — answer only about this company; never report or assume data from other companies or the system in general.

You help HR professionals, managers, and employees manage employees, payroll, leave, expenses, appraisals, meetings, and HR settings.

Current user role: ${userRole}. ${roleContext[userRole] || ''}
${companyLine}

## What you can do
You can CREATE, UPDATE, DELETE, and FETCH data for:
- Employees (invite/create, update details, view records)
- Leave requests (create, approve, reject, delete, view)
- Expense requests (create, approve, reject, delete, view)
- Payroll (view periods, generate reports)
- Appraisals, KPIs, appraisal periods
- Meetings, Announcements
- HR Settings: departments, branches, designations, leave types, expense types, holidays, salary scales

When someone says "create an employee", "add an employee", "invite a new staff", etc. — ask for the details and do it directly. Never redirect them to setup unless you genuinely detect a missing prerequisite (e.g., the department or designation they named doesn't exist yet).

## Collecting missing details before acting
Before executing any create/update action, make sure you have all required fields. Ask concisely for anything missing.

### Creating an employee — required fields:
- First name, Last name, Email
- Department name (must exist — if not found, tell the user and offer to create it)
- Designation/job title (must exist — if not found, tell the user and offer to create it)
- Employment type (Full-time, Part-time, Contract, etc.)
- Employment start date
- Optional: phone number, gender, date of birth, salary scale, company role

Ask for these one shot: "To create the employee, I need a few details: [list the missing ones]."

### Creating a meeting — required fields:
- Title (default: "Team Meeting" if not specified)
- Meeting start time and end time (ask for date + time if not provided; always confirm the year)
- Location: ask "Will this be Online or Offline?" — only those two options are valid
- Invited guest(s): one or more employee names or emails
- A Google Meet link is automatically generated for Online meetings (via Google Calendar integration)
- Never mention "Zoom" — this system uses **Google Meet** only

### Documents (sales letter, offer letter, warning letter, promotion letter, etc.)
When the user asks to draft a document:
- Ask for recipient full name if missing
- Ask for recipient role/position if missing
- Ask for any document-specific details (salary, start date, issue, etc.)
- Use ${companyName} for letterhead/branding
Collect all missing details first, then produce the complete professional draft.

### Reports
When the user asks for any report, ask: "Do you want a comprehensive sheet/table (CSV download), or just a summary?"
- **Sheet/table:** "Your [type] report is ready. Click 'Download CSV' below."
- **Summary:** Provide key stats in conversational text.

### Account / HR setup (ONLY when user explicitly asks to "set up my account", "configure my HR", etc.)
Explain what each setting does and follow the creation order:
1. **Leave types** — e.g., Annual, Sick, Compassionate. Required before designations.
2. **Expense types** — e.g., Transport, Meals. Required before designations.
3. **Departments** — Organisational units.
4. **Branches** — Physical office locations.
5. **Designations** — Job titles. Must come AFTER leave types and expense types.
6. **Salary scales & payroll credits/debits** — Must exist BEFORE creating payroll.
7. **Payroll periods** — Confirm ALL employees have a salary scale before creating a period.

Do NOT apply this flow for individual create/update requests. Only apply it when the user asks for a full account setup.

## General rules
- Be concise and direct. Lead with the action or answer, then supporting detail.
- Use Nigerian Naira (₦ / NGN) for all monetary values.
- Never fabricate data — only use what is in the HR context provided.
- Format lists clearly when presenting multiple records.
- Today's date: ${new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`;
}

/**
 * Builds the full messages array for Groq.
 * Format: [{ role: 'system'|'user'|'assistant', content: string }]
 */
function buildMessages(systemPrompt, conversationHistory, newMessage, dataContext) {
  const messages = [{ role: 'system', content: systemPrompt }];

  // Include last 10 turns of conversation for context
  const recent = conversationHistory.slice(-10);
  for (const turn of recent) {
    messages.push({
      role:    turn.role === 'assistant' ? 'assistant' : 'user',
      content: turn.content,
    });
  }

  // Inject HR data into the current user message
  const userContent = dataContext
    ? `${newMessage}\n\n---\n[HR Data Context:]\n${dataContext}`
    : newMessage;

  messages.push({ role: 'user', content: userContent });
  return messages;
}

function buildDocumentPrompt(documentType, employee, additionalContext) {
  const today = new Date().toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const dept = employee.department?.name || employee.department || 'N/A';

  const templates = {
    offer_letter: `Generate a professional offer letter:
Employee Name: ${employee.firstName} ${employee.lastName}
Position: ${employee.designation}
Department: ${dept}
Employment Type: ${employee.jobType || 'Permanent'}
Start Date: ${additionalContext.startDate || '[START DATE]'}
Monthly Salary: ₦${additionalContext.salary || '[SALARY]'}
Date: ${today}
${additionalContext.notes ? `Notes: ${additionalContext.notes}` : ''}`,

    warning_letter: `Generate a formal written warning letter:
Employee Name: ${employee.firstName} ${employee.lastName}
Department: ${dept}
Nature of Issue: ${additionalContext.issue || '[DESCRIBE ISSUE]'}
Date of Incident: ${additionalContext.incidentDate || '[DATE]'}
Date: ${today}
${additionalContext.notes ? `Additional Context: ${additionalContext.notes}` : ''}`,

    termination_letter: `Generate a professional employment termination letter:
Employee Name: ${employee.firstName} ${employee.lastName}
Department: ${dept}
Last Working Day: ${additionalContext.lastDay || '[LAST WORKING DAY]'}
Reason: ${additionalContext.reason || '[REASON]'}
Date: ${today}
${additionalContext.notes ? `Notes: ${additionalContext.notes}` : ''}`,

    promotion_letter: `Generate a promotion congratulations letter:
Employee Name: ${employee.firstName} ${employee.lastName}
Current Role: ${employee.designation}
New Role: ${additionalContext.newRole || '[NEW ROLE]'}
New Monthly Salary: ₦${additionalContext.newSalary || '[NEW SALARY]'}
Effective Date: ${additionalContext.effectiveDate || '[EFFECTIVE DATE]'}
Date: ${today}
${additionalContext.notes ? `Notes: ${additionalContext.notes}` : ''}`,
  };

  return (
    templates[documentType] ||
    `Generate a ${documentType} HR document for ${employee.firstName} ${employee.lastName}. Context: ${JSON.stringify(additionalContext)}`
  );
}

function generateId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function escapeCsvCell(val) {
  if (val == null || val === '') return '';
  const str = String(val);
  if (/[,"\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCsvCell).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escapeCsvCell(row[h])).join(','));
  }
  return lines.join('\r\n');
}

/**
 * GET /api/copilot/reports/csv?companyId=xxx&type=payroll|leave|expense|employee
 * Downloads a CSV report. type defaults to payroll.
 */
router.get('/reports/csv', async (req, res) => {
  try {
    const { companyId, type = 'payroll' } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const rows = await fetchReportForCsv(companyId, type);
    const csv = toCsv(rows);

    const typeSlug = String(type).toLowerCase().replace(/s$/, '');
    const filename = `${typeSlug}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8
  } catch (error) {
    console.error('Report CSV error:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/** @deprecated Use GET /reports/csv?type=payroll instead. Kept for backward compatibility. */
router.get('/reports/payroll-csv', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: 'companyId is required' });
    const rows = await fetchReportForCsv(companyId, 'payroll');
    const csv = toCsv(rows);
    const filename = `payroll-report-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate payroll report' });
  }
});

/**
 * GET /api/copilot/debug?companyId=xxx
 * REMOVE BEFORE PRODUCTION - diagnoses model loading and DB queries
 */
router.get('/debug', async (req, res) => {
  const { companyId } = req.query;
  const report = { models: {}, counts: {}, sampleFields: {}, errors: [] };
  const mongoose = require('mongoose');

  report.models.registered = Object.keys(mongoose.models);

  if (!companyId) {
    return res.json({ ...report, note: 'Pass ?companyId=xxx to also run DB queries' });
  }

  const toTest = [
    'PayrollPeriod', 'periodPayData', 'Employee',
    'leaverecords', 'ExpenseRequests', 'AppraisalRequests',
  ];

  for (const name of toTest) {
    try {
      const Model = mongoose.models[name];
      if (!Model) { report.counts[name] = 'NOT_REGISTERED'; continue; }
      const count  = await Model.countDocuments({ companyId });
      const sample = await Model.findOne({ companyId }).lean();
      report.counts[name]      = count;
      report.sampleFields[name] = sample ? Object.keys(sample) : null;
    } catch (e) {
      report.errors.push(name + ': ' + e.message);
    }
  }

  return res.json(report);
});

module.exports = router;