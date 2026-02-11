import type { Thread } from '../types/thread';

export const seedThreads: Thread[] = [
  // ═══════════════════════════════════════════════════════
  // FLOW A: Weekly book review — West SMB
  // Home pill → chat → spawn job → review results → outreach
  // ═══════════════════════════════════════════════════════
  {
    id: 'th_weekly_book_review',
    title: 'Weekly book review — West SMB',
    type: 'PRIORITIZE',
    pinned: true,
    scopeLabel: 'West SMB book',
    needsReview: true,
    scope: { territory: 'West SMB', segment: 'B2B SaaS', timeWindowDays: 7 },
    createdAt: '2026-02-09T09:12:00-08:00',
    updatedAt: '2026-02-10T08:46:00-08:00',
    decisionChips: [
      'Deprioritize touched <30d',
      'Weight intent: medium',
      'Prefer VP+ for multithreading',
    ],
    spawnedJobIds: ['job_find_finance_top8', 'job_draft_outreach_6', 'job_multithread_plan_opp_risk'],
    miniOutcome: 'Reviewed 8 account changes',
    progressLine: 'Reviewed 8 account changes \u2022 Ready to find Finance leads',
    keyActions: [
      {
        id: 'ka_001',
        type: 'preference',
        title: 'Updated ranking rules',
        subtitle: 'Deprioritize touched <30d \u2022 Intent weight: medium \u2022 8:41 AM',
      },
      {
        id: 'ka_002',
        type: 'evidence_view',
        title: 'Viewed changes',
        subtitle: '8 accounts with exec movement or intent spikes \u2022 8:40 AM',
        linkLabel: 'Open',
        evidenceId: 'ev_2001',
      },
      {
        id: 'ka_003',
        type: 'job_started',
        title: 'Started job: Find Finance stakeholders',
        subtitle: 'Top 8 changed accounts \u2022 ETA ~3 min \u2022 8:42 AM',
        linkLabel: 'Open job',
        jobId: 'job_find_finance_top8',
      },
      {
        id: 'ka_004',
        type: 'job_completed',
        title: 'Completed: 14 Finance leads found',
        subtitle: '8 accounts covered \u2022 3 coverage gaps \u2022 8:45 AM',
        linkLabel: 'View results',
        jobId: 'job_find_finance_top8',
        evidenceId: 'ev_3102',
      },
      {
        id: 'ka_005',
        type: 'job_needs_review',
        title: 'Needs approval: 6 outreach drafts',
        subtitle: 'Reason-for-now messaging \u2022 8:46 AM',
        linkLabel: 'Review',
        jobId: 'job_draft_outreach_6',
        evidenceId: 'ev_4202',
      },
    ],
    nextSuggestions: [
      {
        id: 'ns_a1',
        title: 'Review 6 outreach drafts awaiting approval',
        why: 'Drafts ready since 8:46 AM \u2014 approval needed before sending',
        cta: 'Open',
        prompt: 'Show me the draft approval queue',
      },
      {
        id: 'ns_a2',
        title: 'Draft outreach for 8 more leads without messages',
        why: '14 leads found but only 6 have drafts queued',
        cta: 'Run',
        prompt: 'Draft reason-for-now outreach for the remaining 8 leads',
      },
    ],
    askSuggestions: [
      {
        id: 'as_a1',
        question: 'Which 3 accounts should I focus on if I only have 12 minutes?',
        why: 'Prioritizes by signal strength + exec movement',
      },
      {
        id: 'as_a2',
        question: 'Which accounts have an opp but thin Finance coverage?',
        why: 'Identifies multithreading gaps in active opportunities',
      },
    ],
    messages: [
      {
        id: 'msg_001',
        role: 'seller',
        timestamp: '2026-02-10T08:40:00-08:00',
        content: 'What changed in my West SMB book since last week?',
      },
      {
        id: 'msg_002',
        role: 'agent',
        timestamp: '2026-02-10T08:40:20-08:00',
        content:
          '8 accounts changed. Biggest: Acme (VP Sales hire + RevOps hiring spike), Nimbus (new VP RevOps), 2 opp-risk accounts thin on Finance.',
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_2001', label: 'Open changes (8)' },
        ],
      },
      {
        id: 'msg_003',
        role: 'seller',
        timestamp: '2026-02-10T08:41:30-08:00',
        content: 'Deprioritize anything touched in last 30 days; weight intent less.',
      },
      {
        id: 'msg_004',
        role: 'agent',
        timestamp: '2026-02-10T08:41:50-08:00',
        content:
          'Done. Updated ranking. Want me to find Finance stakeholders for the top 8 changed accounts?',
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_2002', label: 'Open ranking (10)' },
        ],
        cardType: 'DECISION_CHIPS',
        cardData: ['Deprioritize touched <30d', 'Weight intent: medium'],
      },
      {
        id: 'msg_005',
        role: 'agent',
        timestamp: '2026-02-10T08:42:00-08:00',
        content:
          "I'll prioritize CFO/VP Finance and flag coverage gaps across the 8 changed accounts.",
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Find Finance stakeholders (top 8 changed accounts)',
          jobType: 'FIND_LEADS',
          inputsSummary: [
            '8 accounts (from "What changed")',
            'Personas: CFO, VP Finance, Head of Finance',
            'Seniority: VP+',
          ],
          outputsExpected: ['Lead list', 'Coverage gaps', 'Suggested next steps'],
          approvalsNeeded: false,
        },
      },
      {
        id: 'msg_006',
        role: 'seller',
        timestamp: '2026-02-10T08:42:10-08:00',
        content: 'Yes\u2014run it.',
      },
      {
        id: 'msg_007',
        role: 'agent',
        timestamp: '2026-02-10T08:45:00-08:00',
        content:
          'Done. Found 14 Finance stakeholders across 8 accounts, with 3 coverage gaps. Want me to draft 6 reason-for-now messages for your top leads?',
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_3102', label: 'View leads (14)' },
        ],
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Draft reason-for-now outreach (6 drafts)',
          jobType: 'DRAFT_OUTREACH',
          inputsSummary: [
            '6 top leads from Finance stakeholder search',
            'Tone: concise',
            'Approval required',
          ],
          outputsExpected: ['6 draft messages', 'Signal-based hooks', 'Approval queue'],
          approvalsNeeded: true,
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FLOW B: Intent spike \u2192 find people \u2192 add to campaign
  // Signal card \u2192 thread \u2192 job \u2192 campaign action
  // ═══════════════════════════════════════════════════════
  {
    id: 'th_intent_crm_modernization',
    title: 'Intent spike: \u201cCRM modernization\u201d',
    type: 'MIXED',
    pinned: false,
    scopeLabel: 'Acme Software',
    scope: { territory: 'West SMB', segment: 'B2B SaaS' },
    createdAt: '2026-02-10T07:30:00-08:00',
    updatedAt: '2026-02-10T07:32:00-08:00',
    decisionChips: [],
    spawnedJobIds: ['job_find_engaged_acme'],
    miniOutcome: 'Proposed lead-find job',
    progressLine: 'Proposed lead-find job \u2022 Awaiting approval',
    nextSuggestions: [
      {
        id: 'ns_b1',
        title: 'Run the lead-find job for Acme',
        why: 'RevOps + Finance stakeholders matching your criteria are ready to search',
        cta: 'Run',
        prompt: 'Yes\u2014run it.',
      },
      {
        id: 'ns_b2',
        title: 'Add 10 leads to \u201cAcme CRM Modernization\u201d campaign',
        why: 'Once leads are found, route them to the campaign for follow-up',
        cta: 'Run',
        prompt: 'Add the top 10 leads to the Acme CRM Modernization campaign and queue 6 reason-for-now drafts for approval.',
      },
    ],
    askSuggestions: [
      {
        id: 'as_b1',
        question: 'What other topics is Acme surging on besides CRM?',
        why: 'May reveal additional angles for outreach',
      },
      {
        id: 'as_b2',
        question: 'Who at Acme engaged with our content in the last 30 days?',
        why: 'Warm leads are more likely to respond',
      },
    ],
    messages: [
      {
        id: 'msg_101',
        role: 'agent',
        timestamp: '2026-02-10T07:30:00-08:00',
        content:
          'Acme is surging on CRM-related research (+72 vs baseline). Want Finance, RevOps, or IT first?',
      },
      {
        id: 'msg_102',
        role: 'seller',
        timestamp: '2026-02-10T07:31:00-08:00',
        content:
          'RevOps + Finance. Prioritize VP+ and people who engaged with our campaign in last 30 days.',
      },
      {
        id: 'msg_103',
        role: 'agent',
        timestamp: '2026-02-10T07:32:00-08:00',
        content:
          "Got it. I'll find 12\u201320 leads across Acme with (VP+), (RevOps/Finance), (recent engagement). Run?",
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Find engaged stakeholders (Acme)',
          jobType: 'FIND_LEADS',
          inputsSummary: [
            'Acme Software',
            'Personas: RevOps, Finance',
            'Seniority: VP+',
            'Engagement: last 30 days',
          ],
          outputsExpected: ['Lead list', 'Engagement indicators'],
          approvalsNeeded: false,
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FLOW C: Outreach approvals \u2192 edit with agent \u2192 approve \u2192 recurring
  // ═══════════════════════════════════════════════════════
  {
    id: 'th_outreach_multithread_top10',
    title: 'Outreach: Multi-thread top 10',
    type: 'OUTREACH',
    pinned: false,
    scopeLabel: 'Top 10 accounts',
    needsReview: true,
    scope: { territory: 'West SMB' },
    createdAt: '2026-02-10T08:50:00-08:00',
    updatedAt: '2026-02-10T08:52:00-08:00',
    decisionChips: ['Tone: concise', 'Signal-driven hooks'],
    spawnedJobIds: ['job_review_8_drafts'],
    miniOutcome: '8 drafts awaiting review',
    progressLine: '8 drafts generated \u2022 Waiting for review',
    keyActions: [
      { id: 'ka_c1', type: 'preference', title: 'Set tone preference: concise', subtitle: 'Signal-driven hooks \u2022 8:50 AM' },
      { id: 'ka_c2', type: 'job_started', title: 'Started job: Draft outreach for 8 leads', subtitle: 'Concise tone \u2022 Signal-driven hooks \u2022 8:50 AM', linkLabel: 'Open job', jobId: 'job_review_8_drafts' },
      { id: 'ka_c3', type: 'job_needs_review', title: '8 drafts ready for approval', subtitle: 'Approval queue \u2022 8:52 AM', linkLabel: 'Review', jobId: 'job_review_8_drafts', evidenceId: 'ev_4201' },
    ],
    nextSuggestions: [
      {
        id: 'ns_c1',
        title: 'Review and approve 8 pending drafts',
        why: 'Drafts waiting in the approval queue since 8:52 AM',
        cta: 'Open',
        prompt: 'Show me the draft approval queue',
      },
      {
        id: 'ns_c2',
        title: 'Make drafts more direct and mention signal hooks',
        why: 'You can steer all 8 drafts at once with a single instruction',
        cta: 'Run',
        prompt: 'Make the messages more direct. Mention the VP Sales hire and RevOps hiring spike. Keep it under 60 words.',
      },
    ],
    askSuggestions: [
      {
        id: 'as_c1',
        question: 'Which drafts have the strongest signal hooks?',
        why: 'Helps you prioritize which messages to send first',
      },
      {
        id: 'as_c2',
        question: 'Can you make these drafts warmer without losing the signal angle?',
        why: 'Adjusts tone while keeping the personalization',
      },
    ],
    messages: [
      {
        id: 'msg_201',
        role: 'seller',
        timestamp: '2026-02-10T08:50:00-08:00',
        content: 'Draft outreach messages for the leads we found yesterday.',
      },
      {
        id: 'msg_202',
        role: 'agent',
        timestamp: '2026-02-10T08:50:15-08:00',
        content:
          "I'll draft personalized outreach for 8 leads based on their signals. Each message will use the signal-driven hook format you prefer.",
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Draft outreach for 8 leads',
          jobType: 'DRAFT_OUTREACH',
          inputsSummary: ['8 leads from lead find results', 'Signal-driven personalization', 'Tone: concise'],
          outputsExpected: ['8 draft messages', 'Signal-based hooks', 'Approval queue'],
          approvalsNeeded: true,
        },
      },
      {
        id: 'msg_203',
        role: 'agent',
        timestamp: '2026-02-10T08:52:00-08:00',
        content:
          'I drafted 8 reason-for-now messages for the leads you selected. Ready for your review.',
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_4201', label: 'Open approvals (8)' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FLOW D: Thread \u2192 evidence \u2192 multithread/opp fix
  // (Uses th_weekly_book_review as entry, but this is the
  //  dedicated multithread opp-risk thread if spawned separately)
  // ═══════════════════════════════════════════════════════
  {
    id: 'th_multithread_opp_risk',
    title: 'Multi-thread opp-risk accounts',
    type: 'MIXED',
    pinned: false,
    scopeLabel: 'West SMB book',
    scope: { territory: 'West SMB', segment: 'B2B SaaS', timeWindowDays: 7 },
    createdAt: '2026-02-10T08:47:00-08:00',
    updatedAt: '2026-02-10T08:47:00-08:00',
    decisionChips: ['Prefer VP+ for multithreading'],
    spawnedJobIds: ['job_multithread_plan_opp_risk'],
    miniOutcome: 'Blocked \u2014 needs 2 inputs',
    progressLine: 'Blocked \u2014 needs opp stage + persona preferences',
    keyActions: [
      { id: 'ka_d1', type: 'job_started', title: 'Started job: Multithread plan', subtitle: '4 opp-risk accounts \u2022 8:47 AM', linkLabel: 'Open job', jobId: 'job_multithread_plan_opp_risk' },
      { id: 'ka_d2', type: 'job_blocked', title: 'Blocked: missing 2 inputs', subtitle: 'Needs opp stage + persona prefs \u2022 8:47 AM', linkLabel: 'Fix', jobId: 'job_multithread_plan_opp_risk', evidenceId: 'ev_needs_attention_01' },
    ],
    nextSuggestions: [
      {
        id: 'ns_d1',
        title: 'Fix missing inputs and rerun multithread plan',
        why: 'Job is blocked \u2014 needs CRM opp stage and persona preferences',
        cta: 'Open',
        prompt: 'Show me the blocked job so I can fix the inputs',
      },
      {
        id: 'ns_d2',
        title: 'Skip multithread plan and find leads directly',
        why: 'Faster path: search for Finance + IT leads at the 4 opp accounts',
        cta: 'Run',
        prompt: 'Find Finance and IT leads for the 4 opp-risk accounts instead',
      },
    ],
    askSuggestions: [
      {
        id: 'as_d1',
        question: 'Which of these accounts have an opp but thin Finance coverage?',
        why: 'Identifies the highest-risk gaps in active opportunities',
      },
      {
        id: 'as_d2',
        question: 'What personas are missing across these 4 accounts?',
        why: 'Shows the specific roles you need to fill',
      },
    ],
    messages: [
      {
        id: 'msg_301',
        role: 'seller',
        timestamp: '2026-02-10T08:47:00-08:00',
        content: 'Which of these accounts have an opp but thin Finance coverage?',
      },
      {
        id: 'msg_302',
        role: 'agent',
        timestamp: '2026-02-10T08:47:20-08:00',
        content:
          '4 opp accounts are thin on Finance + IT. Want me to generate a multithread plan?',
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_needs_attention_01', label: 'View coverage gaps (4)' },
        ],
      },
      {
        id: 'msg_303',
        role: 'agent',
        timestamp: '2026-02-10T08:47:30-08:00',
        content:
          "I'll create a multithread plan for those 4 opp-risk accounts. I need 2 inputs to proceed:",
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Multithread plan for opp-risk accounts',
          jobType: 'MULTITHREAD_PLAN',
          inputsSummary: [
            '4 opp-risk accounts',
            'Needs: CRM opp stage preference (Stage 2+)',
            'Needs: Persona preferences (Finance + IT + Exec sponsor)',
          ],
          outputsExpected: ['Stakeholder map per account', 'Recommended next actions', 'Coverage report'],
          approvalsNeeded: false,
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // BACKGROUND THREADS
  // ═══════════════════════════════════════════════════════

  // Cold start FinTech
  {
    id: 'thr_1009',
    title: 'Cold start: FinTech territory',
    type: 'PRIORITIZE',
    pinned: false,
    scope: { territory: 'West SMB', segment: 'FinTech', timeWindowDays: 30 },
    scopeLabel: 'FinTech territory',
    createdAt: '2026-02-08T11:00:00-08:00',
    updatedAt: '2026-02-09T17:20:00-08:00',
    decisionChips: [],
    spawnedJobIds: [],
    miniOutcome: 'Prioritized 10 FinTech accounts',
    progressLine: 'Prioritized 10 accounts \u2022 Ready to find CFOs',
    nextSuggestions: [
      { id: 'ns_7', title: 'Find CFO/VP Finance across top 5 FinTech accounts', why: 'Accounts ranked but no leads identified yet', cta: 'Run', prompt: 'Find CFOs and VP Finance for my top 5 FinTech accounts' },
      { id: 'ns_8', title: 'Deep-dive on Globex Corp signals', why: 'Highest ranked account with 3 active buying signals', cta: 'Open', prompt: 'Tell me more about Globex Corp \u2014 what signals are driving the rank?' },
    ],
    askSuggestions: [
      { id: 'as_7', question: "What's the best wedge for FinTech accounts right now?", why: 'Common pain points + timing signals across the segment' },
      { id: 'as_8', question: 'Are any of these accounts already in our CRM?', why: 'Checks for existing relationships to leverage' },
    ],
    messages: [
      {
        id: 'msg_9',
        role: 'seller',
        timestamp: '2026-02-08T11:00:00-08:00',
        content: "I'm cold-starting this territory\u2014find 10 accounts with a wedge.",
      },
      {
        id: 'msg_10',
        role: 'agent',
        timestamp: '2026-02-08T11:00:25-08:00',
        content:
          "Welcome to FinTech! I've ranked 10 accounts by combined signal strength. Globex Corp and Vandelay Industries are showing the most activity right now.",
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_2002', label: 'Open ranking (10)' },
        ],
      },
    ],
  },

  // Q4 pipeline cleanup (Earlier)
  {
    id: 'thr_1013',
    title: 'Q4 pipeline cleanup',
    type: 'PRIORITIZE',
    pinned: false,
    scope: { territory: 'West SMB', segment: 'B2B SaaS' },
    createdAt: '2026-01-20T10:00:00-08:00',
    updatedAt: '2026-01-28T14:30:00-08:00',
    decisionChips: ['Remove stale opps', 'Focus on close-able'],
    spawnedJobIds: [],
    miniOutcome: 'Cleaned up 12 stale accounts',
    progressLine: 'Cleaned up 12 stale accounts \u2022 Completed',
    messages: [
      { id: 'msg_17', role: 'seller', timestamp: '2026-01-20T10:00:00-08:00', content: 'Help me clean up my Q4 pipeline \u2014 remove anything stale.' },
      { id: 'msg_18', role: 'agent', timestamp: '2026-01-20T10:00:30-08:00', content: "I found 12 accounts with no engagement in the last 60 days. I'd recommend archiving these and focusing on the 8 accounts with active signals." },
    ],
  },

  // Archived: Holiday outreach
  {
    id: 'thr_1014',
    title: 'Holiday outreach batch',
    type: 'OUTREACH',
    pinned: false,
    archived: true,
    scope: { territory: 'West SMB' },
    createdAt: '2025-12-15T09:00:00-08:00',
    updatedAt: '2025-12-20T11:00:00-08:00',
    decisionChips: ['Warm tone', 'Year-end hook'],
    spawnedJobIds: [],
    miniOutcome: 'Sent 15 holiday outreach messages',
    progressLine: 'Sent 15 messages \u2022 Archived',
    messages: [
      { id: 'msg_19', role: 'seller', timestamp: '2025-12-15T09:00:00-08:00', content: 'Draft holiday outreach for my top accounts with a year-end angle.' },
      { id: 'msg_20', role: 'agent', timestamp: '2025-12-15T09:00:25-08:00', content: "I've drafted 15 warm holiday messages with year-end budget hooks. All have been approved and sent." },
    ],
  },

  // Archived: Competitor displacement
  {
    id: 'thr_1015',
    title: 'Competitor displacement: Vertex accounts',
    type: 'MIXED',
    pinned: false,
    archived: true,
    scope: { territory: 'West SMB', segment: 'Enterprise' },
    createdAt: '2026-01-05T14:00:00-08:00',
    updatedAt: '2026-01-12T16:00:00-08:00',
    decisionChips: ['Vertex competitive play', 'Focus on pain points'],
    spawnedJobIds: [],
    miniOutcome: 'Identified 6 displacement targets',
    progressLine: 'Identified 6 targets \u2022 Archived',
    messages: [
      { id: 'msg_21', role: 'seller', timestamp: '2026-01-05T14:00:00-08:00', content: 'Find accounts currently on Vertex that might be ready to switch.' },
      { id: 'msg_22', role: 'agent', timestamp: '2026-01-05T14:00:30-08:00', content: "I found 6 Vertex accounts showing dissatisfaction signals: contract renewal coming up, support ticket spikes, and hiring for roles that suggest they're evaluating alternatives." },
    ],
  },
];
