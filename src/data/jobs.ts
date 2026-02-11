import type { Job } from '../types/job';

export const seedJobs: Job[] = [
  // ─── Flow 1: Lead find from "what changed" ──────────────
  {
    id: 'job_find_finance_top8',
    originThreadId: 'th_weekly_book_review',
    type: 'FIND_LEADS',
    title: 'Find Finance stakeholders for top 8 changed accounts',
    status: 'COMPLETED',
    createdAt: '2026-02-10T08:42:00-08:00',
    updatedAt: '2026-02-10T08:45:00-08:00',
    scopeOutput: '8 accounts → 14 leads found, 3 coverage gaps',
    inputs: {
      accountIds: ['acc_01', 'acc_02', 'acc_03', 'acc_04', 'acc_05', 'acc_06', 'acc_07', 'acc_09'],
      personas: ['CFO', 'VP Finance', 'Head of Finance'],
      seniority: ['VP', 'CXO'],
      constraints: ['Prefer warm paths', 'Flag coverage gaps'],
    },
    outputs: {
      leadIds: ['ld_901', 'ld_902', 'ld_903', 'ld_904', 'ld_905', 'ld_906', 'ld_907', 'ld_908', 'ld_909', 'ld_910', 'ld_911', 'ld_912', 'ld_913', 'ld_914'],
      summary: { leadsFound: 14, accountsCovered: 8, coverageGaps: 3 },
    },
    evidenceId: 'ev_3102',
    progressStages: ['Scanning accounts', 'Matching personas', 'Ranking leads', 'Checking coverage', 'Complete'],
    currentStage: 4,
    // No viewedAt → shows in "Ready to review"
  },
  {
    id: 'job_draft_outreach_6',
    originThreadId: 'th_weekly_book_review',
    type: 'DRAFT_OUTREACH',
    title: 'Draft reason-for-now outreach (6 drafts)',
    status: 'NEEDS_APPROVAL',
    createdAt: '2026-02-10T08:45:00-08:00',
    updatedAt: '2026-02-10T08:46:00-08:00',
    scopeOutput: '6 leads → 6 drafts created, awaiting review',
    inputs: {
      leadIds: ['ld_901', 'ld_902', 'ld_903', 'ld_904', 'ld_905', 'ld_906'],
      constraints: ['Tone: concise', 'Reason-for-now signals', 'Approval required'],
    },
    outputs: {
      draftIds: ['dr_01', 'dr_02', 'dr_03', 'dr_04', 'dr_05', 'dr_06'],
      summary: { draftsCreated: 6 },
    },
    evidenceId: 'ev_4202',
    progressStages: ['Analyzing signals', 'Drafting messages', 'Personalizing', 'Quality check', 'Ready for review'],
    currentStage: 4,
  },

  // ─── Flow 2: Signal-driven lead find ────────────────────
  {
    id: 'job_find_engaged_acme',
    originThreadId: 'th_intent_crm_modernization',
    type: 'FIND_LEADS',
    title: 'Find engaged RevOps + Finance stakeholders (Acme)',
    status: 'COMPLETED',
    createdAt: '2026-02-09T08:13:40-08:00',
    updatedAt: '2026-02-09T08:20:00-08:00',
    scopeOutput: 'Acme → 16 leads found, 9 engaged in last 30d',
    inputs: {
      accountIds: ['acc_01'],
      personas: ['RevOps', 'Finance'],
      seniority: ['VP', 'CXO'],
      constraints: ['Engaged in last 30d', 'VP+ preferred'],
    },
    outputs: {
      leadIds: ['ld_901', 'ld_902', 'ld_907'],
      summary: { leadsFound: 16, accountsCovered: 1, coverageGaps: 0 },
    },
    evidenceId: 'ev_3103',
    progressStages: ['Scanning Acme', 'Matching VP+ RevOps/Finance', 'Filtering engaged', 'Ranking', 'Complete'],
    currentStage: 4,
  },

  // ─── Flow 3: Outreach drafts needing approval ────────────
  {
    id: 'job_review_8_drafts',
    originThreadId: 'th_outreach_multithread_top10',
    type: 'DRAFT_OUTREACH',
    title: 'Review 8 outreach drafts',
    status: 'NEEDS_APPROVAL',
    createdAt: '2026-02-09T07:56:20-08:00',
    updatedAt: '2026-02-09T08:02:00-08:00',
    scopeOutput: '8 leads → 8 drafts created, awaiting review',
    inputs: {
      leadIds: ['ld_901', 'ld_902', 'ld_903', 'ld_904', 'ld_905', 'ld_906', 'ld_907', 'ld_908'],
      constraints: ['Tone: concise', 'Signal-driven hooks'],
    },
    outputs: {
      draftIds: ['dr_01', 'dr_02', 'dr_03', 'dr_04', 'dr_05', 'dr_06', 'dr_07', 'dr_08'],
      summary: { draftsCreated: 8 },
    },
    evidenceId: 'ev_4201',
    progressStages: ['Analyzing signals', 'Drafting messages', 'Personalizing', 'Quality check', 'Ready for review'],
    currentStage: 4,
  },

  // ─── Flow 4: Blocked, needs attention ───────────────────
  {
    id: 'job_multithread_plan_opp_risk',
    originThreadId: 'th_weekly_book_review',
    type: 'MULTITHREAD_PLAN',
    title: 'Fix: multithread plan needs 2 inputs',
    status: 'FAILED',
    createdAt: '2026-02-09T09:10:00-08:00',
    updatedAt: '2026-02-09T09:10:20-08:00',
    scopeOutput: '4 accounts → needs opp stage + persona preferences',
    inputs: {
      accountIds: ['acc_01', 'acc_02', 'acc_03', 'acc_04'],
      personas: ['Finance', 'IT', 'Exec sponsor'],
    },
    evidenceId: 'ev_needs_attention_01',
    progressStages: ['Loading accounts', 'Checking CRM data', 'Blocked — missing inputs'],
    currentStage: 2,
  },

  // ─── Outreach flow: Plan → Draft → Schedule → Monitor ──
  {
    id: 'job_outreach_01',
    originThreadId: 'thread_outreach_01',
    type: 'OUTREACH_SEQUENCE',
    title: 'Draft reason-for-now outreach (8 leads)',
    status: 'NEEDS_INPUT',
    createdAt: '2026-02-10T09:44:10-08:00',
    updatedAt: '2026-02-10T09:44:10-08:00',
    scopeOutput: '8 leads → 12 drafts created, awaiting review',
    inputs: {
      leadIds: ['lead_01', 'lead_02', 'lead_03', 'lead_04', 'lead_05', 'lead_06', 'lead_07', 'lead_08'],
      constraints: ['Connect-first sequence', 'Reason-for-now signals', 'Approval required'],
    },
    outputs: {
      draftIds: ['odraft_01', 'odraft_02', 'odraft_03', 'odraft_04', 'odraft_05', 'odraft_06', 'odraft_07', 'odraft_08', 'odraft_09', 'odraft_10', 'odraft_11', 'odraft_12'],
      summary: { draftsCreated: 12 },
    },
    evidenceId: 'ev_outreach_drafts_01',
    progressStages: ['Building plan', 'Generating connect requests', 'Generating follow-ups', 'Generating emails', 'Quality check', 'Ready for review'],
    currentStage: 5,
  },

  // ─── Background: Completed (viewed) ─────────────────────
  {
    id: 'job_rerank_west_smb',
    originThreadId: 'th_weekly_book_review',
    type: 'PRIORITIZE',
    title: 'Re-rank West SMB accounts',
    status: 'COMPLETED',
    createdAt: '2026-02-10T08:42:00-08:00',
    updatedAt: '2026-02-10T08:43:00-08:00',
    viewedAt: '2026-02-10T08:45:00-08:00',
    scopeOutput: 'West SMB → 10 accounts reranked',
    inputs: {
      constraints: ['Deprioritize touched <30d', 'Weight intent: medium'],
    },
    outputs: {
      summary: { accountsCovered: 10 },
    },
    evidenceId: 'ev_2002',
    progressStages: ['Gathering signals', 'Applying filters', 'Ranking', 'Complete'],
    currentStage: 3,
  },

  // ─── Background: Archived ───────────────────────────────
  {
    id: 'job_prioritize_fintech',
    originThreadId: 'thr_1009',
    type: 'PRIORITIZE',
    title: 'Prioritize FinTech accounts (cold start)',
    status: 'COMPLETED',
    createdAt: '2026-02-07T10:00:00-08:00',
    updatedAt: '2026-02-07T10:05:00-08:00',
    viewedAt: '2026-02-07T10:10:00-08:00',
    archived: true,
    scopeOutput: 'FinTech territory → 10 accounts ranked',
    inputs: {
      constraints: ['Territory: FinTech', 'Wedge signals only'],
    },
    outputs: {
      summary: { accountsCovered: 10 },
    },
    evidenceId: 'ev_2002',
    progressStages: ['Analyzing signals', 'Ranking', 'Complete'],
    currentStage: 2,
  },
];
