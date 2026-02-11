import type { Evidence, PrioritizedAccountRow, DiscoveryLeadRow } from '../types/evidence';
import { seedDrafts, seedDraftsForOutreach6 } from './drafts';
import { seedOutreachDrafts, defaultOutreachPlan } from './outreachLeads';
import { getAccountLogo } from './accountLogos';
import { getLeadAvatar } from './leadAvatars';

// ── Prioritization flow seed data ──────────────────────────

const prioritizedAccounts: PrioritizedAccountRow[] = [
  { id: 'acc_15', company: 'Apex Ventures', score: 94, primarySignal: 'Series C announced ($65M)', signalType: 'funding', actionItems: ['Connect with VP Revenue', 'Send congrats + POV on scaling GTM', 'Schedule intro call', 'Share relevant case study'], employees: '201–500', industry: 'FinTech', location: 'New York, NY', filterTags: ['recent-funding', 'high-engagement'] },
  { id: 'acc_11', company: 'NovaTech Solutions', score: 93, primarySignal: 'New CRO joined from Salesforce', signalType: 'leadership', actionItems: ['Connect with new CRO', 'Send personalized intro email', 'Map the buying committee', 'Schedule discovery call'], employees: '1,001–5,000', industry: 'Enterprise Software', location: 'Chicago, IL', filterTags: ['leadership-change', 'high-engagement'] },
  { id: 'acc_01', company: 'Acme Software', score: 92, primarySignal: 'VP Finance joined from Snowflake', signalType: 'leadership', actionItems: ['Connect with VP Finance', 'Multi-thread into RevOps', 'Send CRM modernization POV', 'Share relevant case study'], employees: '501–1,000', industry: 'B2B SaaS', location: 'San Mateo, CA', filterTags: ['leadership-change', 'tech-alignment'] },
  { id: 'acc_02', company: 'Northwind Traders', score: 91, primarySignal: 'New VP Revenue Ops hired', signalType: 'leadership', actionItems: ['Intro to new VP RevOps', 'Share CRM modernization playbook', 'Map IT stakeholders', 'Schedule product demo'], employees: '1,001–5,000', industry: 'Logistics & Supply Chain', location: 'Austin, TX', filterTags: ['leadership-change', 'tech-alignment'] },
  { id: 'acc_13', company: 'Cascade Systems', score: 89, primarySignal: 'Pipeline analytics evaluation', signalType: 'tech_fit', actionItems: ['Connect with Head of Enablement', 'Share pipeline analytics benchmark', 'Identify IT stakeholder', 'Request warm intro via 1st connection'], employees: '501–1,000', industry: 'Cloud Infrastructure', location: 'Seattle, WA', filterTags: ['tech-alignment', 'high-engagement'] },
  { id: 'acc_03', company: 'Contoso Cloud', score: 88, primarySignal: 'CIO promoted to President, Digital', signalType: 'leadership', actionItems: ['Send congrats to new President', 'Engage Revenue Analytics team', 'Update CRM with role change', 'Multi-thread Finance'], employees: '1,001–5,000', industry: 'Healthcare IT', location: 'Seattle, WA', filterTags: ['leadership-change'] },
  { id: 'acc_18', company: 'Quantum Financial', score: 87, primarySignal: 'CDO role created', signalType: 'expansion', actionItems: ['Connect with new CDO', 'Send digital transformation POV', 'Engage IT Applications team', 'Schedule executive briefing'], employees: '10,001+', industry: 'Financial Services', location: 'Charlotte, NC', filterTags: ['high-engagement'] },
  { id: 'acc_04', company: 'Fabrikam AI', score: 86, primarySignal: 'Series B announced ($40M)', signalType: 'funding', actionItems: ['Connect with VP Sales (when hired)', 'Share scaling playbook', 'Engage Sales Enablement', 'Position for post-hire outreach'], employees: '5,001–10,000', industry: 'Industrial Manufacturing', location: 'Phoenix, AZ', filterTags: ['recent-funding'] },
  { id: 'acc_12', company: 'BrightPath Analytics', score: 85, primarySignal: 'VP Sales Ops hired', signalType: 'leadership', actionItems: ['Send intro to new VP Sales Ops', 'Share sales intelligence whitepaper', 'Map RevOps org', 'Schedule demo'], employees: '201–500', industry: 'Data Analytics', location: 'Boston, MA', filterTags: ['leadership-change', 'tech-alignment'] },
  { id: 'acc_05', company: 'Globex Corp', score: 84, primarySignal: 'New CRO joined', signalType: 'leadership', actionItems: ['Engage CRO via warm path', 'Share pipeline analytics POV', 'Connect with VP Finance', 'Conference follow-up'], employees: '201–500', industry: 'Cybersecurity', location: 'Denver, CO', filterTags: ['high-engagement'] },
  { id: 'acc_07', company: 'Hooli Inc', score: 82, primarySignal: 'Finance Director promoted to VP', signalType: 'leadership', actionItems: ['Send congrats on promotion', 'Share compliance modernization content', 'Engage CRO', 'Request warm intro'], employees: '501–1,000', industry: 'FinTech', location: 'San Jose, CA', filterTags: ['leadership-change'] },
  { id: 'acc_06', company: 'Initech Systems', score: 81, primarySignal: 'VP Marketing Ops joined', signalType: 'leadership', actionItems: ['Intro to new VP Marketing Ops', 'Share customer data platform POV', 'Engage Director RevOps', 'Map marketing org'], employees: '10,001+', industry: 'Retail', location: 'Los Angeles, CA', filterTags: ['leadership-change', 'high-engagement'] },
  { id: 'acc_14', company: 'Meridian Group', score: 79, primarySignal: 'VP IT joined from Oracle', signalType: 'tech_fit', actionItems: ['Connect with VP IT', 'Share CRM consolidation case study', 'Engage procurement', 'Schedule tech eval session'], employees: '5,001–10,000', industry: 'Professional Services', location: 'Atlanta, GA', filterTags: ['tech-alignment'] },
  { id: 'acc_17', company: 'Velocity Labs', score: 77, primarySignal: 'First VP Sales hired', signalType: 'expansion', actionItems: ['Connect with VP Sales', 'Share GTM scaling playbook', 'Offer founder-level intro', 'Position for early deal'], employees: '100–200', industry: 'DevTools', location: 'Austin, TX', filterTags: ['high-engagement'] },
  { id: 'acc_08', company: 'Pied Piper', score: 75, primarySignal: 'VP Sales Ops joined', signalType: 'leadership', actionItems: ['Intro to VP Sales Ops', 'Share territory planning content', 'Engage VP Revenue', 'Schedule product walkthrough'], employees: '1,001–5,000', industry: 'Energy', location: 'Houston, TX', filterTags: [] },
  { id: 'acc_09', company: 'Vandelay Industries', score: 72, primarySignal: 'VP Sales joined', signalType: 'leadership', actionItems: ['Connect with VP Sales', 'Share forecasting POV', 'Engage finance team'], employees: '200–500', industry: 'FinTech', location: 'New York, NY', filterTags: [] },
  { id: 'acc_16', company: 'Trident Healthcare', score: 70, primarySignal: 'VP RevOps promoted', signalType: 'leadership', actionItems: ['Send congrats', 'Share revenue cycle content', 'Map finance stakeholders'], employees: '1,001–5,000', industry: 'Healthcare IT', location: 'Minneapolis, MN', filterTags: [] },
  { id: 'acc_19', company: 'Summit Retail', score: 68, primarySignal: 'VP Digital Commerce joined', signalType: 'expansion', actionItems: ['Intro to VP Digital Commerce', 'Share omnichannel CX POV', 'Engage IT team'], employees: '501–1,000', industry: 'Retail Tech', location: 'Dallas, TX', filterTags: [] },
  { id: 'acc_10', company: 'Stark Digital', score: 65, primarySignal: 'VP promoted internally', signalType: 'leadership', actionItems: ['Send congrats on promotion', 'Share ABM content', 'Engage marketing team'], employees: '100–200', industry: 'MarTech', location: 'Portland, OR', filterTags: [] },
  { id: 'acc_20', company: 'Evergreen Data', score: 62, primarySignal: 'VP Marketing hired', signalType: 'expansion', actionItems: ['Connect with VP Marketing', 'Share data-driven sales POV'], employees: '201–500', industry: 'Data Infrastructure', location: 'Denver, CO', filterTags: [] },
];

const discoveryLeads: DiscoveryLeadRow[] = [
  { id: 'ld_922', name: 'Sophia Kim', title: 'VP Revenue', company: 'Apex Ventures', signal: 'Series C funding + GTM expansion', signalType: 'intent', rationale: 'VP Revenue at newly funded company, likely evaluating sales tools', score: 95, signals: ['Series C funding', 'GTM expansion', 'Active on LinkedIn'] },
  { id: 'ld_919', name: 'Daniel Hughes', title: 'CRO', company: 'NovaTech Solutions', signal: 'Started role 12 days ago', signalType: 'job_change', rationale: 'New CRO likely evaluating revenue operations tools', score: 93, signals: ['Recent job change', 'RevOps expansion', 'Active on LinkedIn'] },
  { id: 'ld_901', name: 'Sarah Chen', title: 'CFO', company: 'Acme Software', signal: 'Engaged with CRM content', signalType: 'engagement', rationale: 'CFO at account with VP Sales hire + RevOps expansion', score: 92, signals: ['VP Sales hire', 'RevOps hiring spike', 'Content engagement'] },
  { id: 'ld_903', name: 'Emily Watson', title: 'VP Finance', company: 'Northwind Traders', signal: 'Champion engagement up 40%', signalType: 'engagement', rationale: '1st-degree connection with rising engagement signals', score: 91, signals: ['Champion engagement up', 'Competitor migration signal', 'Direct connection'] },
  { id: 'ld_904', name: 'James Park', title: 'VP Revenue Operations', company: 'Northwind Traders', signal: 'CRM modernization research', signalType: 'intent', rationale: 'VP RevOps at account researching CRM modernization', score: 90, signals: ['Active in last 7d', 'CRM modernization topic', 'Product page view'] },
  { id: 'ld_921', name: 'Ryan Cooper', title: 'Head of Sales Enablement', company: 'Cascade Systems', signal: 'Pipeline analytics evaluation', signalType: 'tech_stack', rationale: '1st-degree connection evaluating pipeline analytics tools', score: 89, signals: ['Pipeline analytics interest', 'Team growth', 'Direct connection'] },
  { id: 'ld_905', name: 'Priya Sharma', title: 'Head of Finance Ops', company: 'Contoso Cloud', signal: 'RevOps automation interest', signalType: 'intent', rationale: 'Finance Ops lead at account with CIO promotion', score: 88, signals: ['Hiring ramp: Analytics', 'RevOps automation interest'] },
  { id: 'ld_906', name: 'David Kim', title: 'SVP Sales', company: 'Globex Corp', signal: 'Conference speaker + product launch', signalType: 'engagement', rationale: 'SVP Sales at account with new CRO and product launch', score: 87, signals: ['Product launch mention', 'Conference speaker', 'Active LinkedIn poster'] },
  { id: 'ld_920', name: 'Jessica Martinez', title: 'VP Sales Operations', company: 'BrightPath Analytics', signal: 'Started role 21 days ago', signalType: 'job_change', rationale: 'New VP Sales Ops likely building out sales intelligence stack', score: 86, signals: ['New role', 'Sales intelligence evaluation', 'Tech stack change'] },
  { id: 'ld_902', name: 'Marcus Rivera', title: 'CFO', company: 'Acme Software', signal: 'Budget expansion signal', signalType: 'intent', rationale: 'CFO at account with active opportunity + budget expansion', score: 85, signals: ['Quarterly earnings call', 'Budget expansion'] },
  { id: 'ld_907', name: 'Rachel Foster', title: 'VP GTM Systems', company: 'Acme Software', signal: 'New role + team expansion', signalType: 'job_change', rationale: 'VP GTM Systems building out RevOps infrastructure', score: 84, signals: ['New role announcement', 'Team expansion'] },
  { id: 'ld_908', name: 'Tom Baker', title: 'CRO', company: 'Hooli Inc', signal: 'Board meeting + active LinkedIn', signalType: 'engagement', rationale: 'CRO actively posting about revenue strategy', score: 83, signals: ['Board meeting signal', 'Active LinkedIn poster'] },
  { id: 'ld_924', name: 'Angela Torres', title: 'Director, Revenue Analytics', company: 'Velocity Labs', signal: 'GTM buildout underway', signalType: 'tech_stack', rationale: 'Revenue Analytics lead at company building first sales org', score: 82, signals: ['First VP Sales hire', 'GTM buildout'] },
  { id: 'ld_909', name: 'Lisa Chang', title: 'VP Revenue', company: 'Pied Piper', signal: 'Just promoted + solution search', signalType: 'job_change', rationale: 'Recently promoted VP actively searching for solutions', score: 81, signals: ['Just promoted', 'Solution search active'] },
  { id: 'ld_910', name: 'Alex Thompson', title: 'VP Sales Operations', company: 'Pied Piper', signal: 'Territory planning topics', signalType: 'intent', rationale: 'VP Sales Ops researching territory planning solutions', score: 80, signals: ['Territory planning topics', 'Attended industry event'] },
  { id: 'ld_925', name: 'Patrick Chen', title: 'CDO', company: 'Quantum Financial', signal: 'Digital transformation initiative', signalType: 'intent', rationale: 'Newly created CDO role driving digital transformation', score: 79, signals: ['Digital transformation initiative', 'CDO role created'] },
  { id: 'ld_911', name: 'Nina Patel', title: 'Head of Sales Enablement', company: 'Fabrikam AI', signal: 'Hiring surge + tech stack change', signalType: 'tech_stack', rationale: 'Head of Enablement at recently funded company changing tech stack', score: 79, signals: ['Hiring surge', 'Tech stack change'] },
  { id: 'ld_912', name: "Kevin O'Brien", title: 'Director, FP&A', company: 'Fabrikam AI', signal: 'CPQ evaluation + reorg window', signalType: 'intent', rationale: 'FP&A Director at company evaluating CPQ during reorg', score: 78, signals: ['CPQ evaluation', 'Likely reorg window'] },
  { id: 'ld_923', name: 'Mark Sullivan', title: 'VP IT Applications', company: 'Meridian Group', signal: 'CRM consolidation initiative', signalType: 'tech_stack', rationale: 'VP IT driving CRM consolidation across the organization', score: 77, signals: ['CRM consolidation initiative', 'Tech evaluation'] },
  { id: 'ld_913', name: 'Maria Gonzalez', title: 'VP Finance', company: 'Globex Corp', signal: 'Annual planning + CRM evaluation', signalType: 'intent', rationale: 'VP Finance during annual planning cycle evaluating CRM', score: 76, signals: ['Annual planning underway', 'CRM evaluation'] },
  { id: 'ld_914', name: 'Robert Lee', title: 'Director RevOps', company: 'Initech Systems', signal: 'Attended webinar + whitepaper', signalType: 'engagement', rationale: 'Director RevOps showing high engagement with educational content', score: 75, signals: ['Attended webinar', 'Downloaded whitepaper'] },
  { id: 'ld_915', name: 'Samantha Wright', title: 'CFO', company: 'Hooli Inc', signal: 'Expansion budget signal', signalType: 'intent', rationale: 'CFO at account with expansion budget and compliance focus', score: 74, signals: ['Expansion budget signal', 'Compliance modernization'] },
  { id: 'ld_916', name: 'Chris Taylor', title: 'VP Partnerships', company: 'Acme Software', signal: 'Channel strategy shift', signalType: 'engagement', rationale: 'VP Partnerships with referral potential + shared past company', score: 73, signals: ['Channel strategy shift', 'Referral potential'] },
  { id: 'ld_917', name: 'Amanda Chen', title: 'Director, Revenue Analytics', company: 'Contoso Cloud', signal: 'Data platform migration', signalType: 'tech_stack', rationale: '1st-degree connection during data platform migration', score: 72, signals: ['Data platform migration', 'Team growth'] },
  { id: 'ld_918', name: 'Brian Moore', title: 'VP IT Applications', company: 'Northwind Traders', signal: 'Tech evaluation phase', signalType: 'tech_stack', rationale: 'VP IT during active tech evaluation and CRM modernization', score: 71, signals: ['Tech evaluation phase', 'CRM modernization'] },
];

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
      { id: 'chip_outreach_plan', label: 'Draft reason-for-now outreach', seedPrompt: "Draft reason-for-now outreach for my lead list." },
      { id: 'chip_approvals', label: 'Show drafts waiting for approval', seedPrompt: "Show drafts waiting for approval." },
      { id: 'chip_prioritize', label: 'Prioritize my accounts', seedPrompt: "Prioritize my accounts across my territory." },
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
        jobId: 'job_approve_campaign',
        title: 'Approve campaign sequence (Acme)',
        jobTypeLabel: 'Outreach',
        scopeLabel: '6 drafts',
        updated: '30m ago',
        status: 'Needs review',
        primaryCta: { label: 'Review', targetState: 'APPROVALS' },
      },
      {
        id: 'jobtile_003',
        jobId: 'job_multithread_blocked',
        title: 'Multithread plan needs 2 inputs',
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
    context: { jobId: 'job_workspace_book_review' },
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
    context: { jobId: 'job_workspace_book_review' },
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

  // ═══════════════════════════════════════════════════════
  // OUTREACH FLOW: Plan → Draft → Schedule → Monitor
  // ═══════════════════════════════════════════════════════

  // Outreach Plan Builder (original)
  {
    id: 'ev_outreach_plan_01',
    type: 'OUTREACH_PLAN_BUILDER',
    title: 'Build outreach plan',
    subtitle: 'You picked 8 leads. I\'ll draft content and schedule execution after your review.',
    context: { jobId: 'job_workspace_outreach' },
    generatedAt: '2026-02-10T09:42:00-08:00',
    outreachPlan: defaultOutreachPlan,
    leadListId: 'leadlist_west_smb_weekly_01',
    leadCount: 8,
  },

  // Outreach Plan Builder (co-creation flow from 14 Finance leads)
  {
    id: 'ev_outreach_collab_plan',
    type: 'OUTREACH_PLAN_BUILDER',
    title: 'CRM modernization + RevOps automation',
    subtitle: '8 selected leads \u2022 Co-created sequence',
    context: { jobId: 'job_finance_leads_done' },
    generatedAt: '2026-02-10T08:46:00-08:00',
    leadListId: 'leadlist_west_smb_weekly_01',
    leadCount: 8,
  },

  // Outreach Draft Review (co-creation flow)
  {
    id: 'ev_outreach_collab_drafts',
    type: 'OUTREACH_DRAFT_REVIEW',
    title: 'Review drafts (8)',
    subtitle: 'CRM modernization + RevOps \u2022 Connection notes, emails, InMails',
    context: { jobId: 'job_outreach_drafts_8' },
    generatedAt: '2026-02-10T08:52:00-08:00',
    outreachDrafts: seedOutreachDrafts,
    leadListId: 'leadlist_west_smb_weekly_01',
    leadCount: 8,
  },

  // Outreach Draft Review
  {
    id: 'ev_outreach_drafts_01',
    type: 'OUTREACH_DRAFT_REVIEW',
    title: 'Review drafts (12)',
    subtitle: 'Connection requests, follow-up messages, and emails for 8 leads.',
    context: { jobId: 'job_workspace_outreach' },
    generatedAt: '2026-02-10T09:44:00-08:00',
    outreachDrafts: seedOutreachDrafts,
    leadListId: 'leadlist_west_smb_weekly_01',
    leadCount: 8,
  },

  // Execution Monitor
  {
    id: 'ev_outreach_exec_01',
    type: 'EXECUTION_MONITOR',
    title: 'Outreach running',
    subtitle: '8 leads • 3-step sequence • Connect-first',
    context: { jobId: 'job_workspace_outreach' },
    generatedAt: '2026-02-10T10:00:00-08:00',
    executionByLead: [
      { leadId: 'lead_01', currentStepId: 'step_01', status: 'QUEUED', nextActionAt: '2026-02-10T10:30:00-08:00' },
      { leadId: 'lead_02', currentStepId: 'step_01', status: 'QUEUED', nextActionAt: '2026-02-10T10:31:00-08:00' },
      { leadId: 'lead_03', currentStepId: 'step_01', status: 'QUEUED', nextActionAt: '2026-02-10T10:32:00-08:00' },
      { leadId: 'lead_04', currentStepId: 'step_01', status: 'QUEUED', nextActionAt: '2026-02-10T10:33:00-08:00' },
      { leadId: 'lead_05', currentStepId: 'step_01', status: 'QUEUED', nextActionAt: '2026-02-10T10:34:00-08:00' },
      { leadId: 'lead_06', currentStepId: 'step_01', status: 'QUEUED', nextActionAt: '2026-02-10T10:35:00-08:00' },
      { leadId: 'lead_07', currentStepId: 'step_01', status: 'QUEUED', nextActionAt: '2026-02-10T10:36:00-08:00' },
      { leadId: 'lead_08', currentStepId: 'step_01', status: 'QUEUED', nextActionAt: '2026-02-10T10:37:00-08:00' },
    ],
    executionEvents: [],
    executionSummary: { total: 8, sent: 0, waiting: 0, replied: 0 },
  },

  // ═══════════════════════════════════════════════════════
  // PRIORITIZATION → LEAD DISCOVERY FLOW
  // ═══════════════════════════════════════════════════════

  // Step 1: Reasoning animation — Accounts
  {
    id: 'ev_prioritize_reasoning',
    type: 'REASONING_ANIMATION',
    title: 'Analyzing your territory',
    subtitle: 'Scanning 134 accounts in West SMB for buying signals',
    generatedAt: '2026-02-10T10:10:00-08:00',
    reasoningSteps: [
      { label: 'Analyzing your territory', duration: 1500, icon: 'search' },
      { label: 'Identifying buying signals', duration: 1500, icon: 'zap' },
      { label: 'Prioritizing top accounts', duration: 1500, icon: 'target' },
    ],
    reasoningAutoAdvanceEvidenceId: 'ev_prioritize_accounts',
  },

  // Step 2: Prioritized accounts table with filter chips
  {
    id: 'ev_prioritize_accounts',
    type: 'ACCOUNTS_PRIORITIZED',
    title: 'Prioritized accounts — West SMB',
    subtitle: '20 accounts ranked by buying intent, engagement, and leadership signals',
    generatedAt: '2026-02-10T10:10:05-08:00',
    filterChips: [
      { id: 'high-engagement', label: 'High engagement', count: 7 },
      { id: 'tech-alignment', label: 'Tech alignment', count: 5 },
      { id: 'recent-funding', label: 'Recent funding', count: 2 },
      { id: 'leadership-change', label: 'Leadership change', count: 9 },
    ],
    accountsPrioritized: prioritizedAccounts,
    findLeadsLabel: 'Next: Find leads in these accounts',
  },

  // Step 3: Reasoning animation — Leads
  {
    id: 'ev_leads_reasoning',
    type: 'REASONING_ANIMATION',
    title: 'Finding leads in prioritized accounts',
    subtitle: 'Scanning decision makers, engagement signals, and warm paths',
    generatedAt: '2026-02-10T10:11:00-08:00',
    reasoningSteps: [
      { label: 'Scanning prioritized accounts', duration: 1500, icon: 'search' },
      { label: 'Identifying key decision makers', duration: 1500, icon: 'users' },
      { label: 'Analyzing engagement signals', duration: 1500, icon: 'chart' },
    ],
    reasoningAutoAdvanceEvidenceId: 'ev_3102',
  },

  // Step 4: Leads discovery (split view — table + chat)
  {
    id: 'ev_leads_discovery',
    type: 'LEADS_DISCOVERY',
    title: 'Lead discovery — 25 high-potential leads',
    subtitle: '25 leads across your prioritized accounts',
    generatedAt: '2026-02-10T10:11:05-08:00',
    leadsDiscovery: discoveryLeads,
    totalLeadsCount: 25,
    quickResponses: [
      'Yes, apply those filters and prioritize job changes',
      'Focus only on VP level and above',
      'This looks good, let\'s proceed',
    ],
    agentOpeningMessage: 'I\'ve identified **25 high-potential leads** across your prioritized accounts. Here are some additional signals I recommend considering:\n\n• **Job changes in last 90 days** — Decision makers who recently joined\n• **Technology stack alignment** — Companies using complementary tools\n• **Engagement history** — Past interactions with your content\n\nShould I apply these filters to refine the list further?',
  },

  // Step 5: Final leads list (all 25)
  {
    id: 'ev_leads_final',
    type: 'LEADS_DISCOVERY',
    title: 'Final lead list — 25 leads ready',
    subtitle: '25 leads from 14 accounts, prioritized by engagement and intent',
    generatedAt: '2026-02-10T10:12:00-08:00',
    leadsDiscovery: discoveryLeads,
    totalLeadsCount: 25,
  },
];
