# HR Copilot — Integration Guide

AI-powered HR Copilot using **Groq (Llama 3.3 70B)** — completely free within generous daily limits.
Built for your Node.js + MongoDB HR system.

---

## Why Groq Instead of a Paid API?

| | Groq (Llama 3.3 70B) | OpenAI GPT-4o | Anthropic Claude Sonnet |
|---|---|---|---|
| **Free tier** | ✅ 14,400 req/day, 30 req/min | ❌ No free tier | ❌ No free tier |
| **Speed** | Extremely fast | Fast | Fast |
| **Quality for HR tasks** | Excellent | Excellent | Excellent |
| **SDK** | OpenAI-compatible | `openai` | `@anthropic-ai/sdk` |

Get your free API key at: **https://console.groq.com**

---

## Project File Structure

```
controller/Copilot/
├── intentDetector.js    ← classifies user intent (read vs write, which module)
├── queryBuilder.js      ← builds MongoDB read queries per intent
├── dataFetcher.js       ← executes queries, joins data, resolves user context
├── contextFormatter.js  ← formats DB data into text for the AI + formats mutation results
├── mutationBuilder.js   ← uses Groq to parse write commands into structured JSON
└── mutationExecutor.js  ← executes DB writes (create/update/approve/reject/delete)

routes/
└── copilot.js           ← 4 API endpoints, orchestrates the full pipeline
```

---

## How the Pipeline Works

### Read pipeline (fetch/query)

```
User: "How many employees do we have?"
    ↓
intentDetector.js   → intent: { primary: 'employees' }
    ↓
queryBuilder.js     → MongoDB find() query config
    ↓
dataFetcher.js      → runs queries in parallel, joins names, computes stats
    ↓
contextFormatter.js → formats results as readable text
    ↓
Groq (Llama 3.3)    → reasons over data, writes natural reply
    ↓
Response: { reply, intent, sources, conversationId, resolvedRole }
```

### Write pipeline (create/update/approve/reject/delete)

```
User: "Approve John's leave request"
    ↓
mutationBuilder.js  → detects write intent, calls Groq to extract:
                       { action: "approve", entity: "leave", filters: { employeeName: "John" } }
    ↓
mutationExecutor.js → finds DB record, applies update, enforces role permissions
    ↓
contextFormatter.js → formats outcome as plain text
    ↓
Groq (Llama 3.3)    → narrates result in natural language
    ↓
Response: { reply, mutation: { action, entity }, result: { ok, message, count } }
```

---

## Supported Modules

| Module | Read | Create | Update | Approve/Reject | Delete |
|---|---|---|---|---|---|
| **Employees** | ✅ | — | ✅ (safe fields) | — | — |
| **Payroll** | ✅ | — | — | — | — |
| **Absence / Leave** | ✅ | ✅ | ✅ | ✅ | ✅ (admin) |
| **Expenses** | ✅ | ✅ | ✅ | ✅ | ✅ (admin) |
| **Appraisal Requests** | ✅ | — | ✅ | ✅ | — |
| **Appraisal Periods** | ✅ | ✅ | ✅ | — | ✅ (admin) |
| **KPIs** | ✅ | ✅ | ✅ | — | ✅ (admin) |
| **Meetings** | ✅ | ✅ | ✅ | — | ✅ |
| **Departments** | ✅ | ✅ | ✅ | — | ✅ (admin) |
| **Branches** | ✅ | ✅ | ✅ | — | ✅ (admin) |
| **Designations** | ✅ | ✅ | ✅ | — | ✅ (admin) |
| **Holidays** | ✅ | ✅ | ✅ | — | ✅ (admin) |
| **Announcements** | — | ✅ | — | — | ✅ |
| **Reports & Analytics** | ✅ | — | — | — | — |
| **Document Generation** | — | ✅ | — | — | — |

---

## Role Permissions

| Role | Resolved from | Read | Write |
|---|---|---|---|
| `super_admin` | `companyId` provided | Full company | All actions |
| `admin` | userId → Company (not isSuperAdmin) | Full company | All actions |
| `manager` | userId → Employee (isManager: true) | Own dept | approve/reject/create/update |
| `employee` | userId → Employee (isManager: false) | Own records | create only |

---

## API Endpoints

### `POST /api/copilot/chat`

The single endpoint for **all** interactions — reads, writes, and document-style queries.

**Authentication:** Pass either `companyId` OR `userId`. The backend resolves role automatically from the database.

```js
// Request body
{
  message:             string,          // required
  companyId?:          string,          // use this for super_admin access
  userId?:             string,          // use this for employee/manager/admin
  userRole?:           string,          // hint — overridden by DB lookup
  conversationHistory: Array,           // [] on first message
  conversationId?:     string           // returned from previous response
}

// Success response
{
  reply:          string,               // AI-generated natural language reply
  intent?:        object,              // { primary, secondary, confidence, filters }
  sources?:       string[],            // e.g. ["employees (12 records)"]
  mutation?:      object,              // present for write commands: { action, entity }
  result?:        object,              // present for write commands: { ok, message, count }
  conversationId: string,
  model:          string,              // e.g. "llama-3.3-70b-versatile"
  resolvedRole:   string               // actual role used for access control
}
```

---

### `POST /api/copilot/generate-document`

Generates a full HR document for a specific employee.

```js
// Request body
{
  documentType: "offer_letter",        // offer_letter | warning_letter | termination_letter | promotion_letter
  employeeId:   "64abc123def456",
  companyId?:   "6985028e6911fd919f108cfd",   // or userId
  additionalContext: {
    // offer_letter
    startDate: "1 March 2026",
    salary:    "500,000",
    // warning_letter
    issue:         "Repeated tardiness",
    incidentDate:  "2026-02-10",
    // termination_letter
    lastDay:  "2026-03-31",
    reason:   "Redundancy",
    // promotion_letter
    newRole:       "Senior Engineer",
    newSalary:     "800,000",
    effectiveDate: "1 March 2026"
  }
}

// Response
{
  document:     string,               // full formatted document text
  employeeName: string,
  documentType: string,
  generatedAt:  string
}
```

---

### `POST /api/copilot/summarise`

Dashboard AI insights widget — one-paragraph executive summary of current HR state.

```js
// Request
{ companyId: "6985028e6911fd919f108cfd" }
// or
{ userId: "64abc123def456", userRole: "admin" }

// Response
{
  summary:     string,
  generatedAt: string
}
```

---

### `GET /api/copilot/reports/csv`

Downloads a CSV report. Use when the user requests any report in sheet/table format.

```
GET /api/copilot/reports/csv?companyId=6985028e6911fd919f108cfd&type=payroll
```

**Query params:**
- `companyId` (required)
- `type`: `payroll` | `leave` | `expense` | `employee` (default: `payroll`)

**Response:** CSV file, e.g.:
- `payroll-report-2026-02-22.csv` — periodName, employeeName, department, totalEarnings, deductions, netEarnings, salaries, bonus, etc.
- `leave-report-2026-02-22.csv` — employeeName, department, leaveType, startDate, endDate, daysRequested, status, etc.
- `expense-report-2026-02-22.csv` — employeeName, expenseType, amount, expenseDate, status, description
- `employee-report-2026-02-22.csv` — fullName, email, department, designation, jobType, status, startDate, gender, isManager

`GET /api/copilot/reports/payroll-csv` is kept for backward compatibility (same as `type=payroll`).

---

### `GET /api/copilot/suggestions`

Returns suggested questions for the chat UI input placeholder / quick-action chips.

```
GET /api/copilot/suggestions

Response:
{
  "suggestions": [
    "How many employees do we have?",
    "List all pending expense requests",
    "..."
  ]
}
```

---

## Frontend Integration Guide

### 1. Basic chat widget (React)

```jsx
import { useState, useRef } from 'react';

const COPILOT_URL = '/api/copilot';

export function HRCopilot({ companyId, userId }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [conversationId, setConvId] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);  // { url, label } when report CSV is available

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const res = await fetch(`${COPILOT_URL}/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:             userMsg,
          companyId,           // pass companyId for super_admin, or userId for employee/manager
          conversationHistory: messages,
          conversationId,
        }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.conversationId) setConvId(data.conversationId);

      // IMPORTANT: Show the CSV download link — the backend returns downloadUrl when a report
      // is offered. Store it so you can render it below the last assistant message.
      if (data.downloadUrl) {
        setDownloadLink({ url: data.downloadUrl, label: data.downloadLabel || 'Download CSV' });
      } else {
        setDownloadLink(null);
      }

      // If it was a write action, optionally refresh the relevant page data
      if (data.mutation?.action) {
        console.log(`Action: ${data.mutation.action} ${data.mutation.entity}`, data.result);
        // e.g. dispatch a Redux action to refetch leave records
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="copilot-widget">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>{m.content}</div>
        ))}
        {loading && <div className="message assistant typing">Thinking...</div>}
        {/* Show CSV download link when backend returns downloadUrl */}
        {downloadLink && (
          <div className="message assistant download-row">
            <a href={downloadLink.url} className="btn-download-csv" target="_blank" rel="noopener noreferrer">
              {downloadLink.label}
            </a>
          </div>
        )}
      </div>
      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything about HR..."
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}
```

---

### 2. Detecting write vs read responses

The response shape differs slightly for write (mutation) commands:

```js
const res = await fetch('/api/copilot/chat', { ... });
const data = await res.json();

// For reads:
//   data.reply    — AI answer
//   data.sources  — ["employees (12 records)"]
//   data.intent   — { primary: "employees", ... }

// For writes:
//   data.reply    — AI narration of what happened
//   data.mutation — { action: "approve", entity: "leave" }
//   data.result   — { ok: true, message: "Approved 1 leave request", count: 1 }

if (data.mutation) {
  const { action, entity } = data.mutation;
  // Trigger a refetch of the affected module
  if (entity === 'leave')    refetchLeaveRecords();
  if (entity === 'expense')  refetchExpenses();
  if (entity === 'employee') refetchEmployees();
  if (entity === 'meeting')  refetchMeetings();
}
```

---

### 3. Dashboard summary widget

```jsx
export function HRSummaryWidget({ companyId }) {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    fetch('/api/copilot/summarise', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ companyId }),
    })
      .then(r => r.json())
      .then(d => setSummary(d.summary));
  }, [companyId]);

  return <div className="ai-summary">{summary || 'Loading AI summary...'}</div>;
}
```

---

### 4. Suggested questions / quick-action chips

```jsx
export function CopilotSuggestions({ onSelect }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch('/api/copilot/suggestions')
      .then(r => r.json())
      .then(d => setSuggestions(d.suggestions));
  }, []);

  return (
    <div className="suggestions">
      {suggestions.map((s, i) => (
        <button key={i} onClick={() => onSelect(s)}>{s}</button>
      ))}
    </div>
  );
}
```

---

### 5. Floating chat button (bottom-right)

```jsx
import { useState } from 'react';
import { HRCopilot } from './HRCopilot';
import { CopilotSuggestions } from './CopilotSuggestions';

export function CopilotFAB({ companyId }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  return (
    <>
      <button className="fab" onClick={() => setOpen(o => !o)}>
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="copilot-drawer">
          <div className="copilot-header">
            <span>HR Copilot</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <HRCopilot companyId={companyId} />

          {/* Show quick-action chips before first message */}
          <CopilotSuggestions onSelect={msg => setInput(msg)} />
        </div>
      )}
    </>
  );
}
```

---

### 6. Document generation from frontend

```js
async function generateDocument(employeeId, documentType, context) {
  const res = await fetch('/api/copilot/generate-document', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentType,                       // 'offer_letter' | 'warning_letter' | etc.
      employeeId,
      companyId: '6985028e6911fd919f108cfd',
      additionalContext: context,
    }),
  });

  const { document, employeeName } = await res.json();

  // Open in a print/preview modal or download as PDF
  printOrDownload(document, `${documentType}_${employeeName}.txt`);
}

// Example calls
generateDocument(emp._id, 'offer_letter', { startDate: '1 March 2026', salary: '500,000' });
generateDocument(emp._id, 'warning_letter', { issue: 'Absenteeism', incidentDate: '2026-02-15' });
generateDocument(emp._id, 'promotion_letter', { newRole: 'Lead Engineer', newSalary: '900,000', effectiveDate: '1 March 2026' });
```

---

### 7. What the user can type (example commands)

#### Fetching data
| Message | Module queried |
|---|---|
| "How many employees do we have?" | Employees |
| "Show all pending leave requests" | Absence |
| "What was total payroll this month?" | Payroll |
| "Who has the highest expense claims?" | Expenses |
| "Show appraisal progress for all employees" | Appraisal Period |
| "List all KPI groups" | KPIs |
| "Show upcoming meetings this week" | Meetings |
| "Show all departments and their managers" | HR Settings |
| "List all public holidays" | HR Settings |
| "Generate an employee report" | Reports |
| "Generate an absence report by leave type" | Reports |
| "Generate an expense report" | Reports |

#### Writing data
| Message | Action |
|---|---|
| "Approve John's leave request" | approve → leave |
| "Reject Mary's expense claim with comment 'receipt missing'" | reject → expense |
| "Apply for annual leave from 2026-03-01 to 2026-03-05" | create → leave |
| "Submit an expense: ₦15,000 for transport on 2026-02-20" | create → expense |
| "Update John's designation to Senior Developer" | update → employee |
| "Schedule a team meeting tomorrow at 10am in the boardroom" | create → meeting |
| "Create a department called Product Design" | create → department |
| "Add a branch in Lagos with code LGS-001" | create → branch |
| "Add a designation: Principal Engineer, grade 7" | create → designation |
| "Add a public holiday: Easter on 2026-04-03" | create → holiday |
| "Create a KPI: Customer Satisfaction, target 90%" | create → kpi |
| "Create appraisal period Q1 2026 (Jan–Mar)" | create → appraisalPeriod |
| "Activate the Q1 2026 appraisal period" | activate → appraisalPeriod |
| "Close the Q1 2026 appraisal period" | close → appraisalPeriod |
| "Post an announcement: Office closed on Monday" | create → announcement |
| "Draft an offer letter for Adebayo Ogunleye" | Document Generation |

---

## Environment Variables

```env
# Required
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your existing variables (unchanged)
MONGO_URL=mongodb+srv://...
PORT=8800
NODE_ENV=development
```

Get your free Groq key at **https://console.groq.com** — no credit card required.

---

## Setup

```bash
# Install dependencies (if not already installed)
npm install openai   # Groq uses the OpenAI-compatible SDK

# Start the server
npm run dev
```

The copilot is mounted at:
```
app.use('/api/copilot', copilotRouter);
```

All routes:
```
POST /api/copilot/chat
POST /api/copilot/generate-document
POST /api/copilot/summarise
GET  /api/copilot/suggestions
GET  /api/copilot/debug?companyId=xxx   ← remove before production
```

---

*Built with Node.js, MongoDB, and Groq Llama 3.3 70B (free tier).*
