import type { Evidence } from '../types/evidence';
import { seedDrafts, seedDraftsForOutreach6 } from './drafts';
import { getAccountLogo } from './accountLogos';
import { getLeadAvatar } from './leadAvatars';

export const seedEvidence: Evidence[] = [
  // Agent Home (ev_home)
  {
    id: 'ev_home',
    type: 'AGENT_HOME',
    title: 'Today',
    generatedAt: '2026-02-10T08:00:00-08:00',
    inputPlaceholders: [
      "I have 12 minutes—give me 3 best next actions.",
      "My manager asked about Acme—what changed there?",
      "Only show opp accounts where we're not multithreaded.",
      "I'm cold-starting this territory—find 10 accounts with a wedge.",
    ],
    chips: [
      { id: 'chip_quickwins', label: 'Quick wins (12 min)', seedPrompt: "I have 12 minutes—give me 3 best next actions." },
      { id: 'chip_changed', label: 'What changed since last week?', seedPrompt: "What changed in my West SMB book since last week?" },
      { id: 'chip_hot', label: 'Hot accounts right now', seedPrompt: "Show me the 5 hottest accounts right now and why." },
      { id: 'chip_risk', label: 'Pipeline risk: opp + not multithreaded', seedPrompt: "Show opp accounts where we're not multithreaded enough." },
      { id: 'chip_cfos', label: 'Find CFOs/Finance for top accounts', seedPrompt: "Find CFOs and VPs of Finance for the top accounts this week." },
      { id: 'chip_coldstart', label: 'Find me 10 accounts with a clear wedge', seedPrompt: "I'm cold-starting this territory—find 10 accounts with a wedge." },
      { id: 'chip_draft', label: 'Draft outreach with reason-for-now', seedPrompt: "Draft outreach using the reason-for-now signals." },
      { id: 'chip_approvals', label: 'Show drafts waiting for approval', seedPrompt: "Show drafts waiting for approval." },
    ],
    signalCards: [
      {
        id: 'sig_card_intent_01',
        category: 'Intent',
        title: 'Intent spike: "CRM modernization"',
        whyNow: 'Acme is surging on CRM-related research this week (+72 vs baseline)',
        meta: { entities: 1, updated: '6h ago', confidence: 'High' },
        entities: [{ type: 'account', id: 'acc_01', name: 'Acme Software', logoUrl: getAccountLogo('acc_01') }],
        primaryCta: { label: 'Find leads', actionType: 'FIND_PEOPLE', payload: { accountId: 'acc_01', personaPack: ['RevOps', 'Sales Ops', 'IT Apps'], topic: 'CRM modernization' } },
        secondaryCta: { label: 'Prioritize account', actionType: 'INTERNAL_ACTION', payload: { accountId: 'acc_01', priority: 'High', list: 'This week' } },
        preview: {
          evidence: [
            { label: 'Topic surge', value: '"CRM modernization" (+72), "RevOps automation" (+41)' },
            { label: 'Stage signals', value: 'More visits to integration docs + pricing pages (last 3 days)' },
            { label: 'Buying committee', value: '3 functions engaging this week (Sales Ops, IT, Finance)' },
          ],
          targets: [
            { type: 'lead', id: 'ld_jenna', name: 'Jenna Park', title: 'VP Revenue Operations', degree: '2nd', avatarUrl: getLeadAvatar('ld_jenna') },
            { type: 'lead', id: 'ld_miguel', name: 'Miguel Santos', title: 'Director, Sales Operations', degree: '3rd', avatarUrl: getLeadAvatar('ld_miguel') },
            { type: 'lead', id: 'ld_priya', name: 'Priya Nair', title: 'IT Applications Manager', degree: '2nd', avatarUrl: getLeadAvatar('ld_priya') },
          ],
          recommendation: 'Start with RevOps + IT apps; anchor on rollout + integrations, not product pitch.',
        },
      },
      {
        id: 'sig_card_dm_01',
        category: 'Decision maker change',
        title: 'New decision maker: VP RevOps joined Nimbus',
        whyNow: 'Role started 4 days ago — perfect timing to introduce your POV',
        meta: { entities: 1, updated: '2h ago', confidence: 'High' },
        entities: [{ type: 'account', id: 'acc_02', name: 'Northwind Traders', logoUrl: getAccountLogo('acc_02') }],
        primaryCta: { label: 'Draft outreach', actionType: 'CREATE_OUTREACH', payload: { leadId: 'ld_alicia', accountId: 'acc_02', reason: 'new role + likely RevOps initiatives', requiresApproval: true } },
        secondaryCta: { label: 'Update buying committee', actionType: 'FIND_PEOPLE', payload: { accountId: 'acc_02', personaPack: ['RevOps', 'Sales Ops', 'CRO Office', 'IT Apps'] } },
        preview: {
          evidence: [
            { label: 'New role', value: 'Started 4 days ago' },
            { label: 'Moved from', value: 'Vertex (Enterprise SaaS)' },
            { label: 'Likely focus', value: 'Pipeline hygiene + forecasting revamp (profile/activity cues)' },
            { label: 'Coverage gap', value: 'No saved RevOps leader at this account' },
          ],
          targets: [
            { type: 'lead', id: 'ld_alicia', name: 'Alicia Chen', title: 'VP Revenue Operations', degree: '2nd', avatarUrl: getLeadAvatar('ld_alicia') },
          ],
          recommendation: 'Send a short congrats + POV tied to RevOps automation + forecasting reliability.',
        },
      },
      {
        id: 'sig_card_risk_01',
        category: 'Pipeline risk',
        title: 'Pipeline risk: Opp open, but thin coverage',
        whyNow: '4 opp accounts missing Finance + IT stakeholders',
        meta: { entities: 4, updated: 'today', confidence: 'High' },
        entities: [
          { type: 'account', id: 'acc_01', name: 'Acme Software', logoUrl: getAccountLogo('acc_01') },
          { type: 'account', id: 'acc_02', name: 'Northwind Traders', logoUrl: getAccountLogo('acc_02') },
          { type: 'account', id: 'acc_03', name: 'Contoso Cloud', logoUrl: getAccountLogo('acc_03') },
          { type: 'account', id: 'acc_04', name: 'Fabrikam AI', logoUrl: getAccountLogo('acc_04') },
        ],
        primaryCta: { label: 'Find missing personas', actionType: 'FIND_PEOPLE', payload: { accountIds: ['acc_01', 'acc_02', 'acc_03', 'acc_04'], personaPack: ['Finance', 'IT Apps', 'Security', 'Procurement'] } },
        secondaryCta: { label: 'Map buying group', actionType: 'INTERNAL_ACTION', payload: { jobType: 'MULTITHREAD_PLAN', accountIds: ['acc_01', 'acc_02', 'acc_03', 'acc_04'] } },
        preview: {
          evidence: [
            { label: 'Acme', value: 'Missing Finance owner; only 1 saved DM' },
            { label: 'Northwind', value: 'Missing IT Apps; no Security stakeholder' },
            { label: 'Contoso', value: 'Missing Procurement; last touch 9 days ago' },
          ],
          recommendation: 'Run multithread plan to generate stakeholder candidates + next steps per account.',
        },
      },
      {
        id: 'sig_card_engage_01',
        category: 'Engagement intent',
        title: 'High intent: 2 people engaged with your \u201cRevOps automation\u201d campaign',
        whyNow: 'Both engaged in the last 48 hours (asset + follow-up click)',
        meta: { entities: 1, leads: 2, updated: '1h ago', confidence: 'High' },
        entities: [{ type: 'account', id: 'acc_03', name: 'Contoso Cloud', logoUrl: getAccountLogo('acc_03') }],
        primaryCta: { label: 'Draft follow-up', actionType: 'CREATE_OUTREACH', payload: { accountId: 'acc_03', leadIds: ['ld_samir', 'ld_lauren'], asset: 'RevOps automation playbook', requiresApproval: true } },
        secondaryCta: { label: 'Add to campaign', actionType: 'INTERNAL_ACTION', payload: { campaign: 'RevOps automation follow-up', crmLog: true, leadIds: ['ld_samir', 'ld_lauren'] } },
        preview: {
          targets: [
            { type: 'lead', id: 'ld_samir', name: 'Samir Iqbal', title: 'Director, Revenue Operations', degree: '2nd', avatarUrl: getLeadAvatar('ld_samir') },
            { type: 'lead', id: 'ld_lauren', name: 'Lauren Wu', title: 'Sr Manager, Sales Operations', degree: '2nd', avatarUrl: getLeadAvatar('ld_lauren') },
          ],
          evidence: [
            { label: 'Engaged asset', value: 'Clicked \u201cRevOps automation playbook\u201d (yesterday)' },
            { label: 'Evaluation signal', value: 'Visited pricing page (today)' },
            { label: 'Connection strength', value: 'Both are 2nd-degree connections' },
          ],
          recommendation: 'Send a tight follow-up offering 15-min benchmarking + 1 relevant customer example.',
        },
      },
    ],
    jobTiles: [
      {
        id: 'jobtile_001',
        jobId: 'job_review_8_drafts',
        title: 'Review 8 drafts',
        jobTypeLabel: 'Outreach',
        scopeLabel: '8 drafts',
        updated: '12m ago',
        status: 'Needs review',
        preview: {
          type: 'facepile',
          items: [
            { name: 'Samir Iqbal', imageUrl: getLeadAvatar('ld_samir') },
            { name: 'Lauren Wu', imageUrl: getLeadAvatar('ld_lauren') },
            { name: 'Jenna Park', imageUrl: getLeadAvatar('ld_jenna') },
            { name: 'Miguel Santos', imageUrl: getLeadAvatar('ld_miguel') },
          ],
          overflowCount: 4,
        },
        primaryCta: { label: 'Review', targetState: 'APPROVALS' },
      },
      {
        id: 'jobtile_002',
        jobId: 'job_draft_outreach_6',
        title: 'Review 6 drafts',
        jobTypeLabel: 'Outreach',
        scopeLabel: '6 drafts',
        updated: '20m ago',
        status: 'Needs review',
        primaryCta: { label: 'Review', targetState: 'APPROVALS' },
      },
      {
        id: 'jobtile_003',
        jobId: 'job_multithread_plan_opp_risk',
        title: 'Fix: multithread plan needs 2 inputs',
        jobTypeLabel: 'Multithread',
        scopeLabel: 'Multithread plan',
        updated: '1h ago',
        status: 'Blocked',
        preview: {
          type: 'logopile',
          items: [
            { name: 'Northwind Traders', imageUrl: getAccountLogo('acc_02') },
            { name: 'Fabrikam AI', imageUrl: getAccountLogo('acc_04') },
          ],
        },
        primaryCta: { label: 'Fix', targetState: 'CONFIG' },
      },
    ],
  },

  // What changed diff view
  {
    id: 'ev_2001',
    type: 'ACCOUNTS_DIFF_VIEW',
    title: 'What changed in the last 7 days',
    context: { threadId: 'th_weekly_book_review' },
    generatedAt: '2026-02-10T08:40:30-08:00',
    diffs: [
      {
        accountId: 'acc_01',
        accountName: 'Acme Software',
        changes: [
          { type: 'EXEC_MOVE', detail: 'VP Sales joined (6 days ago)' },
          { type: 'INTENT_SPIKE', detail: 'Buying intent ↑ in last 72h' },
          { type: 'HIRING', detail: 'RevOps team +3 in last week' },
        ],
      },
      {
        accountId: 'acc_02',
        accountName: 'Northwind Traders',
        changes: [
          { type: 'EXEC_MOVE', detail: 'New VP RevOps joined' },
          { type: 'ENGAGEMENT', detail: 'Champion engagement up 40%' },
        ],
      },
      {
        accountId: 'acc_03',
        accountName: 'Contoso Cloud',
        changes: [
          { type: 'EXEC_MOVE', detail: 'New CTO started 5 days ago' },
          { type: 'INTENT_SPIKE', detail: 'Browsing intent +8 in 72h' },
        ],
      },
      {
        accountId: 'acc_04',
        accountName: 'Fabrikam AI',
        changes: [
          { type: 'FUNDING', detail: 'Series B announced ($40M)' },
          { type: 'HIRING', detail: 'Hiring VP Sales — posted 3 days ago' },
        ],
      },
      {
        accountId: 'acc_05',
        accountName: 'Globex Corp',
        changes: [
          { type: 'NEWS', detail: 'Product launch mentioned in TechCrunch' },
        ],
      },
      {
        accountId: 'acc_06',
        accountName: 'Initech Systems',
        changes: [
          { type: 'EXEC_MOVE', detail: 'Director of Sales hired (4 days ago)' },
          { type: 'EXPANSION', detail: 'Team doubled from 5 to 10 reps' },
        ],
      },
      {
        accountId: 'acc_07',
        accountName: 'Hooli Inc',
        changes: [
          { type: 'ENGAGEMENT', detail: 'CRO posted about revenue strategy' },
        ],
      },
      {
        accountId: 'acc_09',
        accountName: 'Vandelay Industries',
        changes: [
          { type: 'NEWS', detail: 'Mentioned in financial press for growth' },
        ],
      },
    ],
  },

  // Ranked accounts table
  {
    id: 'ev_2002',
    type: 'ACCOUNTS_RANKED_TABLE',
    title: 'Prioritized accounts — West SMB (Top 10)',
    context: { threadId: 'th_weekly_book_review' },
    generatedAt: '2026-02-10T08:41:00-08:00',
    columns: [
      { key: 'name', label: 'Account' },
      { key: 'score', label: 'Priority' },
      { key: 'intent', label: 'Intent' },
      { key: 'change', label: 'Change' },
      { key: 'why', label: 'Top drivers' },
    ],
    rows: [
      { id: 'acc_01', name: 'Acme Software', score: 92, intent: 'High', change: '+12', why: ['New VP Sales (6d)', 'Hiring surge in RevOps', 'Product launch mention'] },
      { id: 'acc_03', name: 'Contoso Cloud', score: 89, intent: 'High', change: '+8', why: ['New CTO started', 'Browsing intent surge'] },
      { id: 'acc_02', name: 'Northwind Traders', score: 88, intent: 'Med', change: '+6', why: ['Champion engagement up', 'Competitor migration signal'] },
      { id: 'acc_04', name: 'Fabrikam AI', score: 85, intent: 'High', change: '+5', why: ['Series B funding', 'Hiring VP Sales'] },
      { id: 'acc_06', name: 'Initech Systems', score: 82, intent: 'Med', change: '+4', why: ['New Director of Sales', 'Team expansion 2x'] },
      { id: 'acc_05', name: 'Globex Corp', score: 78, intent: 'Med', change: '+3', why: ['Product launch in press', 'Conference speaker'] },
      { id: 'acc_07', name: 'Hooli Inc', score: 75, intent: 'Low', change: '+2', why: ['CRO active on LinkedIn', 'Board meeting signal'] },
      { id: 'acc_09', name: 'Vandelay Industries', score: 72, intent: 'Low', change: '+1', why: ['Press coverage', 'Recently connected'] },
      { id: 'acc_10', name: 'Stark Digital', score: 68, intent: 'Low', change: '0', why: ['Hiring surge', 'Tech stack change'] },
      { id: 'acc_08', name: 'Pied Piper', score: 64, intent: 'Low', change: '-1', why: ['VP promoted internally', 'Flat intent'] },
    ],
  },

  // Leads table for job_find_finance_top8
  {
    id: 'ev_3102',
    type: 'LEADS_TABLE',
    title: 'Leads found — Top accounts',
    context: { jobId: 'job_find_finance_top8' },
    generatedAt: '2026-02-10T08:44:55-08:00',
    columns: [
      { key: 'name', label: 'Lead' },
      { key: 'title', label: 'Title' },
      { key: 'company', label: 'Company' },
      { key: 'seniority', label: 'Seniority' },
      { key: 'matchScore', label: 'Match' },
      { key: 'signals', label: 'Signals' },
    ],
    rows: [
      { id: 'ld_901', name: 'Sarah Chen', title: 'VP Sales', company: 'Acme Software', seniority: 'VP', matchScore: 95, signals: ['VP Sales hire', 'RevOps hiring spike'] },
      { id: 'ld_902', name: 'Marcus Rivera', title: 'CFO', company: 'Acme Software', seniority: 'CXO', matchScore: 92, signals: ['Quarterly earnings call', 'Budget expansion'] },
      { id: 'ld_903', name: 'Emily Watson', title: 'VP Finance', company: 'Northwind Traders', seniority: 'VP', matchScore: 90, signals: ['Champion engagement up', 'Competitor migration'] },
      { id: 'ld_904', name: 'James Park', title: 'Head of RevOps', company: 'Contoso Cloud', seniority: 'Director', matchScore: 88, signals: ['Active in last 7d', 'Product page view'] },
      { id: 'ld_905', name: 'Priya Sharma', title: 'CFO', company: 'Fabrikam AI', seniority: 'CXO', matchScore: 87, signals: ['Series B funding', 'Hiring VP Sales'] },
      { id: 'ld_906', name: 'David Kim', title: 'VP Operations', company: 'Globex Corp', seniority: 'VP', matchScore: 85, signals: ['Product launch', 'Conference speaker'] },
      { id: 'ld_907', name: 'Rachel Foster', title: 'Director of Sales', company: 'Initech Systems', seniority: 'Director', matchScore: 84, signals: ['New role', 'Team expansion'] },
      { id: 'ld_908', name: 'Tom Baker', title: 'CRO', company: 'Hooli Inc', seniority: 'CXO', matchScore: 83, signals: ['Board meeting signal', 'Active LinkedIn'] },
      { id: 'ld_909', name: 'Lisa Chang', title: 'VP Revenue', company: 'Pied Piper', seniority: 'VP', matchScore: 81, signals: ['Just promoted', 'Solution search'] },
      { id: 'ld_910', name: 'Alex Thompson', title: 'CFO', company: 'Vandelay Industries', seniority: 'CXO', matchScore: 80, signals: ['Press mention', 'Recently connected'] },
      { id: 'ld_911', name: 'Nina Patel', title: 'Head of Growth', company: 'Stark Digital', seniority: 'Director', matchScore: 79, signals: ['Hiring surge', 'Tech stack change'] },
      { id: 'ld_912', name: "Kevin O'Brien", title: 'VP Sales', company: 'Contoso Cloud', seniority: 'VP', matchScore: 78, signals: ['Competitor content', 'Team doubling'] },
    ],
  },

  // Acme leads (job_find_engaged_acme)
  {
    id: 'ev_3103',
    type: 'LEADS_TABLE',
    title: 'Engaged stakeholders — Acme',
    context: { jobId: 'job_find_engaged_acme' },
    generatedAt: '2026-02-09T14:38:00-08:00',
    columns: [
      { key: 'name', label: 'Lead' },
      { key: 'title', label: 'Title' },
      { key: 'company', label: 'Company' },
      { key: 'seniority', label: 'Seniority' },
      { key: 'matchScore', label: 'Match' },
      { key: 'signals', label: 'Signals' },
    ],
    rows: [
      { id: 'ld_901', name: 'Sarah Chen', title: 'VP Sales', company: 'Acme Software', seniority: 'VP', matchScore: 95, signals: ['VP Sales hire', 'RevOps hiring spike'] },
      { id: 'ld_902', name: 'Marcus Rivera', title: 'CFO', company: 'Acme Software', seniority: 'CXO', matchScore: 92, signals: ['Quarterly earnings call', 'Budget expansion'] },
      { id: 'ld_916', name: 'Chris Taylor', title: 'VP Partnerships', company: 'Acme Software', seniority: 'VP', matchScore: 73, signals: ['Channel strategy shift', 'Referral potential'] },
    ],
  },

  // Approval queue (job_review_8_drafts)
  {
    id: 'ev_4201',
    type: 'APPROVAL_QUEUE',
    title: 'Draft outreach — Pending approval',
    context: { jobId: 'job_review_8_drafts' },
    generatedAt: '2026-02-10T08:52:00-08:00',
    items: seedDrafts,
  },

  // Approval queue (job_draft_outreach_6)
  {
    id: 'ev_4202',
    type: 'APPROVAL_QUEUE',
    title: 'Reason-for-now outreach — Pending approval',
    context: { jobId: 'job_draft_outreach_6' },
    generatedAt: '2026-02-10T08:54:00-08:00',
    items: seedDraftsForOutreach6,
  },

  // Needs attention (job_multithread_plan_opp_risk)
  {
    id: 'ev_needs_attention_01',
    type: 'NEEDS_ATTENTION',
    title: "Fix: multithread plan needs inputs",
    context: { jobId: 'job_multithread_plan_opp_risk' },
    generatedAt: '2026-02-10T09:00:00-08:00',
    attentionReason: "This job can't run until you pick opp stages and preferred personas. Two quick selections and it'll start.",
    attentionItems: [
      { id: 'inp_stage', label: 'Choose opp stages to include', description: 'Select which opportunity stages to include in the multithread plan.', actionLabel: 'Stage 2+', actionType: 'PICK_SCOPE' },
      { id: 'inp_personas', label: 'Preferred personas to add', description: 'Select which personas are missing from the buying committee.', actionLabel: 'Finance + IT + Exec sponsor', actionType: 'PICK_SCOPE' },
    ],
  },

  // Job running evidence (template for simulation)
  {
    id: 'ev_job_running',
    type: 'JOB_RUNNING',
    title: 'Job in progress',
    generatedAt: '2026-02-10T08:48:00-08:00',
    stages: ['Initializing', 'Processing', 'Finalizing'],
    currentStage: 0,
    log: [
      { time: '08:48:00', message: 'Job started' },
    ],
  },

  // PRIORITIZE_ACCOUNTS job result (cold start)
  {
    id: 'ev_prioritize_result',
    type: 'ACCOUNTS_RANKED_TABLE',
    title: 'Cold start: Top 10 FinTech accounts with a wedge',
    generatedAt: '2026-02-10T09:10:00-08:00',
    columns: [
      { key: 'name', label: 'Account' },
      { key: 'score', label: 'Wedge Score' },
      { key: 'intent', label: 'Intent' },
      { key: 'change', label: 'Signal' },
      { key: 'why', label: 'Wedge reason' },
    ],
    rows: [
      { id: 'acc_05', name: 'Globex Corp', score: 91, intent: 'High', change: '+9', why: ['Hiring VP Sales', 'Product launch', 'FinTech expansion'] },
      { id: 'acc_09', name: 'Vandelay Industries', score: 87, intent: 'Med', change: '+7', why: ['Press coverage', 'Funding round', 'New market entry'] },
      { id: 'acc_10', name: 'Stark Digital', score: 84, intent: 'Med', change: '+5', why: ['Hiring surge', 'Tech stack change', 'Competitor displacement'] },
      { id: 'acc_04', name: 'Fabrikam AI', score: 82, intent: 'High', change: '+4', why: ['Series B ($40M)', 'Hiring VP Sales'] },
      { id: 'acc_08', name: 'Pied Piper', score: 79, intent: 'Low', change: '+3', why: ['VP promoted internally', 'M&A signal'] },
      { id: 'csa_01', name: 'PayNow Solutions', score: 77, intent: 'Med', change: '+3', why: ['Series A ($18M)', 'Hiring CRO'] },
      { id: 'csa_02', name: 'LedgerFlow', score: 74, intent: 'Med', change: '+2', why: ['Product pivot to enterprise', 'New VP Sales'] },
      { id: 'csa_03', name: 'CryptoBase', score: 72, intent: 'Low', change: '+2', why: ['Regulatory compliance push', 'Team 2x'] },
      { id: 'csa_04', name: 'WealthSync', score: 69, intent: 'Low', change: '+1', why: ['Partnership expansion', 'New CTO'] },
      { id: 'csa_05', name: 'FinStack', score: 66, intent: 'Low', change: '+1', why: ['Conference speaker', 'ABM target signal'] },
    ],
  },

  // MULTITHREAD_PLAN job result (stakeholder gaps)
  {
    id: 'ev_multithread_result',
    type: 'JOB_RESULTS',
    title: 'Multithread plan — Opp risk accounts',
    generatedAt: '2026-02-10T09:15:00-08:00',
    summary: {
      accountsAnalyzed: 4,
      missingPersonas: 9,
      suggestedContacts: 12,
    },
    nextActions: [
      { label: 'Find leads for missing personas', action: 'FIND_LEADS' },
      { label: 'Draft intro messages', action: 'DRAFT_OUTREACH' },
    ],
  },
];
