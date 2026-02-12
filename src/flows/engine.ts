import { useJobStore } from '../store/useJobStore';
import { useAppStore } from '../store/useAppStore';
import { useEvidenceStore } from '../store/useEvidenceStore';
import { useOutreachStore } from '../store/useOutreachStore';
import { emailFirstPlan, linkedInFirstPlan, seedOutreachLeads, seedOutreachDrafts } from '../data/outreachLeads';

import type { Message } from '../types/thread';
import type { Job } from '../types/job';

/** Exported so OnboardingFlow can trigger the discovery flow after reasoning */
export function flowQuickPlayStartExport(jobId: string, intentKey: string) {
  flowQuickPlayStart(jobId, intentKey);
}

/**
 * Deterministic scripted "agent" — pattern matches on seller input and dispatches
 * scripted response sequences with simulated delays.
 * All references are now jobId-centric (no threadId).
 */
export function processSellerMessage(jobId: string, content: string) {
  const lower = content.toLowerCase().trim();

  // ═══════════════════════════════════════════════════
  // OUTREACH CO-CREATION FLOW (chip-driven)
  // These must be checked FIRST to prevent generic matches
  // ═══════════════════════════════════════════════════

  // Step 1: User says "Yes — suggest a plan"
  if (lower.includes('yes') && lower.includes('suggest a plan')) {
    flowOutreachProposePlan(jobId);
    return;
  }
  // Show leads first
  if (lower.includes('show me the 8 leads') || lower.includes('show me the leads')) {
    flowOutreachShowLeads(jobId);
    return;
  }
  // What signals are we using?
  if (lower.includes('what signals')) {
    flowOutreachShowSignals(jobId);
    return;
  }

  // Step 2: Starting channel
  if (lower.includes('start on linkedin first') || lower === 'start on linkedin first') {
    flowOutreachLinkedInFirst(jobId);
    return;
  }
  if (lower.includes('start with email first') || lower === 'start with email first') {
    flowOutreachEmailFirst(jobId);
    return;
  }

  // Step 3: Timing + guardrails
  if (lower.includes('wait 2 days') || lower.includes('wait 3 days') || lower.includes('wait 4 days')) {
    flowOutreachSetTiming(jobId, content);
    return;
  }
  if (lower.includes('stop on any reply')) {
    flowOutreachSetStopCondition(jobId, 'any');
    return;
  }
  if (lower.includes('stop only on email')) {
    flowOutreachSetStopCondition(jobId, 'email');
    return;
  }

  // Step 4: Approvals + business hours
  if (lower.includes('approval required') || lower.includes('auto-send')) {
    flowOutreachSetApproval(jobId, lower.includes('approval required'));
    return;
  }
  if (lower.includes('business hours only') || lower.includes('any time')) {
    flowOutreachSetBusinessHours(jobId, lower.includes('business hours'));
    return;
  }

  // Step 5: Tone/style
  if (lower.includes('keep as-is')) {
    flowOutreachKeepAsIs(jobId);
    return;
  }
  if (lower.includes('shorter') && lower.includes('punchier')) {
    flowOutreachShorterPunchier(jobId);
    return;
  }
  if (lower.includes('more consultative')) {
    flowOutreachConsultative(jobId);
    return;
  }
  if (lower.includes('warm-intro') || lower.includes('warm intro')) {
    flowOutreachWarmIntro(jobId);
    return;
  }

  // Step 6: Value prop angle
  if (lower.includes('cost control') || lower.includes('budget pressure')) {
    flowOutreachValueProp(jobId, 'Cost control / budget pressure');
    return;
  }
  if (lower.includes('revops') && lower.includes('forecast')) {
    flowOutreachValueProp(jobId, 'RevOps + forecast accuracy');
    return;
  }
  if (lower.includes('crm modernization') || (lower.includes('crm') && lower.includes('revops'))) {
    flowOutreachValueProp(jobId, 'CRM modernization + RevOps automation');
    return;
  }

  // Step 7: Personalization / Save & Generate
  if (lower.includes('save lead list') || lower.includes('save & generate') || lower.includes('save and generate')) {
    flowOutreachSaveAndGenerate(jobId);
    return;
  }
  if (lower.includes('personalize by role')) {
    flowOutreachPersonalizeByRole(jobId);
    return;
  }
  if (lower.includes('one template')) {
    flowOutreachOneTemplate(jobId);
    return;
  }

  // Step 8: Open drafts / change sequence
  if (lower.includes('open drafts')) {
    flowOutreachOpenDrafts(jobId);
    return;
  }
  if (lower.includes('change sequence')) {
    flowOutreachChangeSequence(jobId);
    return;
  }
  if (lower.includes('add one more step')) {
    flowOutreachAddOneMoreStep(jobId);
    return;
  }

  // ═══════════════════════════════════════════════════
  // Flow A: "What changed" → Steering → Job spawn → Results → Outreach
  // ═══════════════════════════════════════════════════

  if (lower.includes('what changed') || lower.includes('what\'s changed')) {
    flowWhatChanged(jobId);
    return;
  }
  if (lower.includes('deprioritize') || lower.includes('weight intent')) {
    flowSteering(jobId, content);
    return;
  }
  if (lower.includes('run it') || lower === 'yes' || lower === 'yes\u2014run it.') {
    flowRunJob(jobId);
    return;
  }

  // Flow B: Signal-driven
  if (
    (lower.includes('revops') && lower.includes('finance')) || lower.includes('vp+')
  ) {
    flowSignalLeads(jobId);
    return;
  }
  if (lower.includes('add') && lower.includes('campaign')) {
    flowAddToCampaign(jobId);
    return;
  }

  // Flow C: Edit drafts → approve → recurring
  if (
    lower.includes('make') &&
    (lower.includes('direct') || lower.includes('shorter') || lower.includes('mention'))
  ) {
    flowEditDrafts(jobId);
    return;
  }
  if (lower.includes('approve all') || (lower.includes('schedule') && lower.includes('outreach'))) {
    if (jobId === 'play_001') {
      flowPlayApproveAndSchedule(jobId);
    } else {
      flowApproveAll(jobId);
    }
    return;
  }
  if (lower.includes('recurring') || lower.includes('follow-up nudge')) {
    flowCreateRecurringJob(jobId);
    return;
  }

  // Flow D: Multithread / opp
  if (
    lower.includes('which') && lower.includes('opp') &&
    (lower.includes('thin') || lower.includes('finance') || lower.includes('coverage'))
  ) {
    flowOppCoverage(jobId);
    return;
  }
  if (lower.includes('multithread') || (lower.includes('opp') && lower.includes('thin'))) {
    flowMultithreadPlan(jobId);
    return;
  }

  // ═══════════════════════════════════════════════════
  // QUICK PLAY DISCOVERY: progressive dimension filtering
  // These route discovery-phase messages from chat suggestions
  // ═══════════════════════════════════════════════════

  // Region discovery
  if (lower.includes('focus on bay area') || (lower.includes('bay area') && lower.includes('companies'))) {
    flowDiscoverAccountDimension(jobId, 'region-bay-area'); return;
  }
  if (lower.includes('focus on west coast') || (lower.includes('west coast') && lower.includes('companies'))) {
    flowDiscoverAccountDimension(jobId, 'region-west'); return;
  }
  if (lower.includes('focus on northeast') || (lower.includes('northeast') && lower.includes('companies'))) {
    flowDiscoverAccountDimension(jobId, 'region-northeast'); return;
  }
  if (lower.includes('focus on') && (lower.includes('south') && !lower.includes('southeast')) && lower.includes('companies')) {
    flowDiscoverAccountDimension(jobId, 'region-south'); return;
  }
  if (lower.includes('focus on midwest') || (lower.includes('midwest') && lower.includes('companies'))) {
    flowDiscoverAccountDimension(jobId, 'region-midwest'); return;
  }

  // Industry discovery
  if (lower.includes('focus on ai') || lower.includes('focus on ai/ml') || (lower.includes('ai/ml') && lower.includes('companies'))) {
    flowDiscoverAccountDimension(jobId, 'industry-ai'); return;
  }
  if (lower.includes('focus on saas') && lower.includes('companies')) {
    flowDiscoverAccountDimension(jobId, 'industry-saas'); return;
  }
  if (lower.includes('focus on fintech') || (lower.includes('fintech') && lower.includes('companies'))) {
    flowDiscoverAccountDimension(jobId, 'industry-fintech'); return;
  }
  if (lower.includes('focus on healthtech') || (lower.includes('healthtech') && lower.includes('companies'))) {
    flowDiscoverAccountDimension(jobId, 'industry-healthtech'); return;
  }
  if (lower.includes('focus on enterprise software') || (lower.includes('enterprise software') && lower.includes('companies'))) {
    flowDiscoverAccountDimension(jobId, 'industry-enterprise-sw'); return;
  }

  // Size discovery
  if (lower.includes('startups') || (lower.includes('1') && lower.includes('50') && lower.includes('employee'))) {
    flowDiscoverAccountDimension(jobId, 'size-startup'); return;
  }
  if (lower.includes('51') && lower.includes('200') && lower.includes('employee')) {
    flowDiscoverAccountDimension(jobId, 'size-small'); return;
  }
  if ((lower.includes('201') || lower.includes('mid-size')) && lower.includes('500') && lower.includes('employee')) {
    flowDiscoverAccountDimension(jobId, 'size-midsize'); return;
  }
  if ((lower.includes('501') || lower.includes('growth-stage') || lower.includes('growth stage')) && lower.includes('employee')) {
    flowDiscoverAccountDimension(jobId, 'size-growth'); return;
  }
  if (lower.includes('1,000+') || lower.includes('1000+') || (lower.includes('enterprise') && lower.includes('employee'))) {
    flowDiscoverAccountDimension(jobId, 'size-enterprise'); return;
  }

  // Lead function discovery
  if (lower.includes('focus on sales leaders') || (lower.includes('focus on') && lower.includes('sales') && !lower.includes('operation'))) {
    flowDiscoverLeadDimension(jobId, 'fn-sales'); return;
  }
  if (lower.includes('focus on finance') || (lower.includes('finance') && lower.includes('leaders'))) {
    flowDiscoverLeadDimension(jobId, 'fn-finance'); return;
  }
  if (lower.includes('focus on revops') || (lower.includes('revops') && lower.includes('leaders'))) {
    flowDiscoverLeadDimension(jobId, 'fn-revops'); return;
  }
  if (lower.includes('focus on c-suite') || lower.includes('c-suite executives')) {
    flowDiscoverLeadDimension(jobId, 'fn-c-suite'); return;
  }
  if (lower.includes('focus on engineering') || (lower.includes('engineering') && lower.includes('leaders'))) {
    flowDiscoverLeadDimension(jobId, 'fn-engineering'); return;
  }

  // Lead seniority discovery
  if (lower.includes('vp level and above only') || lower.includes('vp and above only')) {
    flowDiscoverLeadDimension(jobId, 'seniority-vp-plus'); return;
  }
  if (lower.includes('director level') || lower.includes('director+') || lower.includes('director and above')) {
    flowDiscoverLeadDimension(jobId, 'seniority-director'); return;
  }
  if (lower.includes('manager level') || lower.includes('manager+') || lower.includes('manager and above')) {
    flowDiscoverLeadDimension(jobId, 'seniority-manager'); return;
  }

  // Skip discovery — jump to signals for accounts
  if (lower.includes('skip') && lower.includes('signal') && !lower.includes('find leads')) {
    const job = useJobStore.getState().jobsById[jobId];
    const intentKey = job?.scope?.intentKey || '';
    if (intentKey && CARD_CONFIG[intentKey]) {
      transitionToSignalFilters(jobId, intentKey);
      return;
    }
  }

  // Skip signals — find leads now
  if (lower.includes('skip') && lower.includes('find leads')) {
    flowPlayFindLeads(jobId);
    return;
  }

  // Skip lead discovery — proceed to outreach
  if (lower.includes('skip') && lower.includes('proceed to outreach')) {
    flowRefineLeads(jobId, 'proceed');
    return;
  }

  // ═══════════════════════════════════════════════════
  // PLAY WORKSPACE: deterministic play_001 refinements
  // These must be checked BEFORE generic account flows
  // ═══════════════════════════════════════════════════

  // Play step 1a: Filter leadership changes in past 60 days
  if (lower.includes('leadership') && lower.includes('60 day')) {
    flowPlayLeadershipFilter(jobId);
    return;
  }

  // Play step 1b: Filter accounts not touched in 30 days
  if ((lower.includes('haven\'t touched') || lower.includes('not touched') || lower.includes('havent touched')) && lower.includes('30 day')) {
    flowPlayNotTouched30Filter(jobId);
    return;
  }

  // Play step 2: "Look for leads from these accounts" / "Find leads in these X prioritized accounts"
  if (lower.includes('look for leads') || (lower.includes('find leads') && (lower.includes('these accounts') || lower.includes('prioritized accounts') || (lower.includes('these') && lower.includes('account'))))) {
    flowPlayFindLeads(jobId);
    return;
  }

  // Prioritize accounts flow
  if (lower.includes('prioritize') && (lower.includes('account') || lower.includes('territory'))) {
    flowPrioritizeAccounts(jobId);
    return;
  }

  // Conversational account filtering: leadership changes
  if (lower.includes('leadership') && (lower.includes('change') || lower.includes('30 day') || lower.includes('last month'))) {
    flowFilterLeadership(jobId);
    return;
  }

  // Conversational account filtering: CRM opportunities
  if ((lower.includes('existing') || lower.includes('active')) && (lower.includes('opportunit') || lower.includes('crm') || lower.includes('opp'))) {
    flowFilterCrmOpps(jobId);
    return;
  }

  // Find leads in prioritized/filtered accounts (triggered from CTA or chat)
  if (lower.includes('find leads') && (lower.includes('prioritized') || lower.includes('these accounts') || lower.includes('account'))) {
    flowFindLeadsInAccounts(jobId, content);
    return;
  }

  // Leads refinement quick responses
  if (lower.includes('apply those filters') || lower.includes('prioritize job changes')) {
    flowRefineLeads(jobId, 'job_changes');
    return;
  }
  if ((lower.includes('vp level') || lower.includes('vp and above')) && !lower.includes('only')) {
    flowRefineLeads(jobId, 'vp_plus');
    return;
  }
  // Sequence manipulation: lead with email instead of connection request
  if (lower.includes('lead with email') || (lower.includes('email') && lower.includes('day 1') && lower.includes('instead'))) {
    flowSequenceSwapToEmail(jobId);
    return;
  }
  // Sequence manipulation: revert to connection request first
  if ((lower.includes('go back') || lower.includes('revert')) && lower.includes('connection request')) {
    flowSequenceRevertToLinkedIn(jobId);
    return;
  }
  // Sequence manipulation: drop InMail step
  if (lower.includes('drop') && lower.includes('inmail')) {
    flowSequenceDropInmail(jobId);
    return;
  }
  // Sequence manipulation: add InMail back
  if (lower.includes('add') && lower.includes('inmail')) {
    flowSequenceAddInmailBack(jobId);
    return;
  }
  // Sequence manipulation: shorten wait between steps
  if (lower.includes('shorten') && lower.includes('wait')) {
    flowSequenceShortenWait(jobId);
    return;
  }

  // "Looks good, draft the messages" — advance from outreach plan to drafts
  if (lower.includes('looks good') && lower.includes('draft')) {
    flowPlayDraftMessages(jobId);
    return;
  }
  if (lower.includes('looks good') || lower.includes('let\'s proceed') || lower.includes('lets proceed')) {
    flowRefineLeads(jobId, 'proceed');
    return;
  }

  // Save/outreach from leads discovery
  if (lower.includes('save') && lower.includes('lead list')) {
    flowSaveLeadList(jobId);
    return;
  }
  if (lower.includes('start outreach') && lower.includes('lead')) {
    flowStartOutreachFromLeads(jobId);
    return;
  }

  // Generic flows
  if (lower.includes('draft') || lower.includes('outreach') || lower.includes('reason-for-now')) {
    flowDraftOutreach(jobId);
    return;
  }
  if (lower.includes('hot') && lower.includes('account')) {
    flowHotAccounts(jobId);
    return;
  }
  if (lower.includes('quick') || lower.includes('best next') || lower.includes('12 min')) {
    flowQuickAdvice(jobId);
    return;
  }
  if (lower.includes('approval') || lower.includes('drafts waiting')) {
    flowShowApprovals(jobId);
    return;
  }
  if (lower.includes('cold start') || lower.includes('cold-start') || lower.includes('wedge')) {
    flowColdStart(jobId);
    return;
  }
  if (lower.includes('tell me more about:')) {
    flowSignalDetail(jobId, content);
    return;
  }

  flowGeneric(jobId, content);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function addAgentMessage(
  jobId: string,
  content: string,
  extras?: Partial<Message>
) {
  const { addMessage } = useJobStore.getState();
  addMessage(jobId, {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    role: 'agent',
    timestamp: new Date().toISOString(),
    content,
    ...extras,
  });
}

function setEvidence(evidenceId: string) {
  const { setCurrentEvidence } = useAppStore.getState();
  setCurrentEvidence(evidenceId);
}

function navigateToJob(targetJobId: string) {
  const { selectJob } = useAppStore.getState();
  selectJob(targetJobId);
}

function updateJobSuggestions(
  jobId: string,
  nextSuggestions?: Job['nextSuggestions'],
  askSuggestions?: Job['askSuggestions']
) {
  const { updateJob } = useJobStore.getState();
  const updates: Partial<Job> = {};
  if (nextSuggestions !== undefined) updates.nextSuggestions = nextSuggestions;
  if (askSuggestions !== undefined) updates.askSuggestions = askSuggestions;
  updateJob(jobId, updates);
}

/** Create and simulate a child job */
function createAndRunChildJob(
  parentJobId: string,
  config: {
    title: string;
    type: Job['type'];
    evidenceId: string;
    stages: string[];
    scopeOutput: string;
  },
  delayMs: number = 2500
) {
  const { createJobDirect, setJobStatus, updateJobProgress, setJobEvidence, addSpawnedJob } = useJobStore.getState();
  const now = new Date().toISOString();
  const childId = `job_child_${Date.now()}`;

  const job: Job = {
    id: childId,
    kind: 'tracked',
    type: config.type,
    title: config.title,
    status: 'QUEUED',
    has_unread_results: false,
    createdAt: now,
    updatedAt: now,
    last_viewed_at: null,
    expires_at: null,
    archived_at: null,
    schedule: null,
    linked_context: { parent_job_id: parentJobId },
    scopeOutput: config.scopeOutput,
    messages: [],
    progressStages: config.stages,
    currentStage: 0,
  };

  createJobDirect(job);
  addSpawnedJob(parentJobId, childId);

  addAgentMessage(parentJobId, `Running **${config.title}** \u2014 ETA ~${Math.round(delayMs / 1000)}s.`);

  const stageCount = config.stages.length;
  const stageInterval = delayMs / (stageCount + 2);

  setTimeout(() => setJobStatus(childId, 'RUNNING'), 100);

  for (let i = 0; i < stageCount; i++) {
    setTimeout(() => updateJobProgress(childId, i), 200 + i * stageInterval);
  }

  setTimeout(() => {
    setJobStatus(childId, 'READY_TO_REVIEW');
    updateJobProgress(childId, stageCount - 1);
    setJobEvidence(childId, config.evidenceId);
    const { updateJob } = useJobStore.getState();
    updateJob(childId, { has_unread_results: true });

    setEvidence(config.evidenceId);
    navigateToJob(childId);

    addAgentMessage(parentJobId, `Done. ${config.scopeOutput}`, {
      cardType: 'JOB_RESULT',
      cardData: {
        jobId: childId,
        jobTitle: config.title,
        completedTime: new Date().toISOString(),
        highlights: [config.scopeOutput, 'Leads ranked by match score', 'Coverage gaps highlighted'],
      },
    });
  }, delayMs);
}

// ═══════════════════════════════════════════════════════
// OUTREACH CO-CREATION FLOW (chip-driven, 8 steps)
// ═══════════════════════════════════════════════════════

function addAgentMessageWithChips(
  jobId: string,
  content: string,
  chips: string[],
  extras?: Partial<Message>
) {
  const { addMessage } = useJobStore.getState();
  addMessage(jobId, {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    role: 'agent',
    timestamp: new Date().toISOString(),
    content,
    suggestedChips: chips,
    ...extras,
  });
}

// Step 1: Agent proposes v1 (email-first) sequence
function flowOutreachProposePlan(jobId: string) {
  const { setPlan } = useOutreachStore.getState();
  setTimeout(() => {
    // Set v1 plan in the store
    setPlan(jobId, emailFirstPlan);
    setEvidence('ev_outreach_collab_plan');

    addAgentMessageWithChips(
      jobId,
      `Got it. Here's a first pass sequence optimized for speed and high response rate:\n\nDraft sequence v1\n1. Email 1 (Day 0) — personalized "reason-for-now"\n2. LinkedIn connection request (Day 2)\n3. InMail (Day 5) if no response\n4. Email follow-up (Day 8)\n5. Add to nurture (Day 12)\n\nBefore I generate drafts: what's your preference for starting channel?`,
      [
        'Start on LinkedIn first',
        'Start with email first',
        'Depends \u2014 ask me 2 questions',
      ]
    );
  }, 800);
}

// Show the 8 leads first
function flowOutreachShowLeads(jobId: string) {
  setTimeout(() => {
    setEvidence('ev_3102');
    addAgentMessageWithChips(
      jobId,
      'Here are the 8 leads you selected. Review them on the right, then let me know when you\u2019re ready to build a plan.',
      [
        'Yes \u2014 suggest a plan',
        'Change selection',
      ],
      { attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_3102', label: 'View leads (8 selected)' }] }
    );
  }, 600);
}

// What signals are we using?
function flowOutreachShowSignals(jobId: string) {
  setTimeout(() => {
    addAgentMessageWithChips(
      jobId,
      'For these 8 leads, I\u2019m using:\n\u2022 **Intent signals**: CRM modernization (+72), RevOps automation\n\u2022 **Exec moves**: VP Sales hire, new RevOps leadership\n\u2022 **Engagement**: Product page views, content downloads\n\u2022 **Hiring surges**: RevOps and Finance teams expanding\n\u2022 **Funding**: Series B, budget expansion\n\nThese power the personalization hooks in each draft.',
      [
        'Yes \u2014 suggest a plan',
        'Show me the 8 leads first',
      ]
    );
  }, 600);
}

// Step 2: User chooses LinkedIn first → switch to v2
function flowOutreachLinkedInFirst(jobId: string) {
  const { setPlan } = useOutreachStore.getState();
  setTimeout(() => {
    // Switch to LinkedIn-first plan (still with default 2-day wait)
    const plan = { ...linkedInFirstPlan };
    setPlan(jobId, plan);
    setEvidence('ev_outreach_collab_plan');

    addAgentMessageWithChips(
      jobId,
      'Makes sense \u2014 LinkedIn first is cleaner and feels warmer.\n\nI\u2019ll revise to:\n\u2022 Day 0: Connection request\n\u2022 If not accepted \u2192 Email in cadence\n\u2022 If no reply \u2192 follow-ups + InMail\n\nTwo quick knobs:\n1. How long should we wait before switching to email?\n2. Do you want to stop the sequence automatically if they reply anywhere?',
      [
        'Wait 2 days',
        'Wait 4 days',
        'Stop on any reply',
        'Stop only on email reply',
      ]
    );
  }, 700);
}

// User keeps email first (v1 stays, move to timing knobs)
function flowOutreachEmailFirst(jobId: string) {
  setTimeout(() => {
    addAgentMessageWithChips(
      jobId,
      'Got it \u2014 email first is great for accounts where you don\u2019t have a LinkedIn path yet.\n\nTwo quick knobs:\n1. How long should we wait between steps?\n2. Stop automatically if they reply?',
      [
        'Wait 2 days',
        'Wait 4 days',
        'Stop on any reply',
        'Stop only on email reply',
      ]
    );
  }, 700);
}

// Step 3: User sets timing
function flowOutreachSetTiming(jobId: string, content: string) {
  const lower = content.toLowerCase();
  let waitDays = 3;
  if (lower.includes('wait 2')) waitDays = 2;
  else if (lower.includes('wait 4')) waitDays = 4;

  const { setPlan, outreachPlansById } = useOutreachStore.getState();
  const currentPlan = outreachPlansById[jobId];
  if (currentPlan) {
    // Adjust all steps relative to the wait offset from root
    const adjustedSteps = currentPlan.steps.map((s, i) => {
      if (i === 0) return s; // root stays at Day 0
      // Scale the day offsets proportionally based on wait
      const basePlan = currentPlan.steps[0].channel === 'CONNECT_REQUEST' ? linkedInFirstPlan : emailFirstPlan;
      const baseStep = basePlan.steps[i];
      if (!baseStep) return s;
      const ratio = waitDays / 3; // 3 is the default wait
      return { ...s, dayOffset: Math.round(baseStep.dayOffset * ratio) };
    });
    setPlan(jobId, { ...currentPlan, steps: adjustedSteps });
  }

  setTimeout(() => {
    addAgentMessageWithChips(
      jobId,
      `Done. Updated timing and stop condition.\n\nNext: approvals + business hours.\n\u2022 I recommend "approval required" for the first run.\n\u2022 Business hours only avoids awkward sends.`,
      [
        'Approval required',
        'Auto-send',
        'Business hours only',
        'Any time',
      ]
    );
  }, 600);
}

// Stop condition
function flowOutreachSetStopCondition(jobId: string, type: 'any' | 'email') {
  const { setPlan, outreachPlansById } = useOutreachStore.getState();
  const plan = outreachPlansById[jobId];
  if (plan) {
    setPlan(jobId, {
      ...plan,
      guardrails: { ...plan.guardrails, stopOnReply: true },
    });
  }

  setTimeout(() => {
    addAgentMessageWithChips(
      jobId,
      `Got it \u2014 ${type === 'any' ? 'stopping on any reply across channels' : 'stopping only on email replies'}.\n\nNext: approvals + business hours.\n\u2022 I recommend "approval required" for the first run.\n\u2022 Business hours only avoids awkward sends.`,
      [
        'Approval required',
        'Auto-send',
        'Business hours only',
        'Any time',
      ]
    );
  }, 600);
}

// Step 4: Approval mode
function flowOutreachSetApproval(jobId: string, requireApproval: boolean) {
  const { setPlan, outreachPlansById } = useOutreachStore.getState();
  const plan = outreachPlansById[jobId];
  if (plan) {
    const updatedSteps = plan.steps.map(s => ({
      ...s,
      requiresApproval: s.channel === 'NURTURE' ? false : requireApproval,
    }));
    setPlan(jobId, {
      ...plan,
      steps: updatedSteps,
      guardrails: { ...plan.guardrails, approvalRequired: requireApproval },
    });
  }

  setTimeout(() => {
    const steps = useOutreachStore.getState().outreachPlansById[jobId]?.steps || [];

    const stepLines = steps.map((s) => {
      const approval = s.requiresApproval ? ' (approval req.)' : '';
      const cond = s.condition ? ` ${s.condition === 'IF_NOT_ACCEPTED' ? 'if not accepted' : s.condition === 'IF_NO_REPLY' ? 'if no reply' : s.condition === 'IF_CONNECT_ACCEPTED' ? 'if accepted' : ''}` : '';
      return `\u2022 Day ${s.dayOffset}: ${s.label || s.channel}${approval}${cond}`;
    }).join('\n');

    addAgentMessageWithChips(
      jobId,
      `Perfect. Now let\u2019s tune the actual steps.\n\nRevised sequence v2 (working draft)\n${stepLines}\n\nWant to:\n\u2022 keep this as-is, or\n\u2022 tweak tone and length of messages?`,
      [
        'Keep as-is',
        'Make it shorter + punchier',
        'More consultative',
        'Add a warm-intro ask if possible',
      ]
    );
  }, 700);
}

// Business hours
function flowOutreachSetBusinessHours(jobId: string, businessHoursOnly: boolean) {
  const { setPlan, outreachPlansById } = useOutreachStore.getState();
  const plan = outreachPlansById[jobId];
  if (plan) {
    setPlan(jobId, {
      ...plan,
      guardrails: { ...plan.guardrails, businessHoursOnly },
    });
  }

  setTimeout(() => {
    addAgentMessage(jobId, `Updated \u2014 ${businessHoursOnly ? 'business hours only' : 'any time'}. The approval/timing choices above still apply.`);
  }, 400);
}

// Step 5: Tone choices
function flowOutreachKeepAsIs(jobId: string) {
  setTimeout(() => {
    addAgentMessageWithChips(
      jobId,
      'Great \u2014 keeping the sequence as-is.\n\nBefore I generate drafts: choose a value prop angle for Finance stakeholders.',
      [
        'Cost control / budget pressure',
        'RevOps + forecast accuracy',
        'CRM modernization',
        'Let me write it',
      ]
    );
  }, 600);
}

function flowOutreachShorterPunchier(jobId: string) {
  setTimeout(() => {
    addAgentMessageWithChips(
      jobId,
      'Got it. I\u2019ll incorporate a warm intro ask only when we detect a strong path (mutual 1st-degree + relevant role). Otherwise, default to the standard copy.\n\nBefore I generate drafts: choose a value prop angle for Finance stakeholders.',
      [
        'Cost control / budget pressure',
        'RevOps + forecast accuracy',
        'CRM modernization',
        'Let me write it',
      ]
    );
  }, 600);
}

function flowOutreachConsultative(jobId: string) {
  setTimeout(() => {
    addAgentMessageWithChips(
      jobId,
      'Noted \u2014 I\u2019ll make the tone more consultative: open with curiosity, reference a peer benchmark, and close with a soft ask.\n\nBefore I generate drafts: choose a value prop angle for Finance stakeholders.',
      [
        'Cost control / budget pressure',
        'RevOps + forecast accuracy',
        'CRM modernization',
        'Let me write it',
      ]
    );
  }, 600);
}

function flowOutreachWarmIntro(jobId: string) {
  setTimeout(() => {
    addAgentMessageWithChips(
      jobId,
      'Got it. I\u2019ll incorporate a warm intro ask only when we detect a strong path (mutual 1st-degree + relevant role). Otherwise, default to the standard copy.\n\nBefore I generate drafts: choose a value prop angle for Finance stakeholders.',
      [
        'Cost control / budget pressure',
        'RevOps + forecast accuracy',
        'CRM modernization',
        'Let me write it',
      ]
    );
  }, 600);
}

// Step 6: Value prop angle
function flowOutreachValueProp(jobId: string, angle: string) {
  setTimeout(() => {
    addAgentMessageWithChips(
      jobId,
      `Great. I\u2019ll generate:\n\u2022 8 connection notes (\u2264 250 chars)\n\u2022 8 emails (\u2264 120 words)\n\u2022 8 InMails (\u2264 400 chars)\nAll aligned to **${angle}**, using the account/lead signals we found.\n\nLast check: should I personalize by role (CFO vs VP Finance vs RevOps), or keep one template?`,
      [
        'Personalize by role',
        'One template is fine',
        'Save lead list & generate drafts',
      ]
    );
  }, 600);
}

// "Save lead list & generate drafts" — shortcut that saves + creates drafts in one step
function flowOutreachSaveAndGenerate(jobId: string) {
  void useOutreachStore.getState(); // access store if needed later

  setTimeout(() => {
    // Create the drafts job
    const { createJobDirect, addSpawnedJob } = useJobStore.getState();
    const now = new Date().toISOString();
    const draftsJobId = 'job_outreach_drafts_8';

    const draftsJob: Job = {
      id: draftsJobId,
      kind: 'tracked',
      type: 'DRAFT_OUTREACH',
      title: 'Draft reason-for-now outreach (8 leads)',
      status: 'NEEDS_INPUT',
      has_unread_results: true,
      createdAt: now,
      updatedAt: now,
      last_viewed_at: null,
      expires_at: null,
      archived_at: null,
      schedule: null,
      linked_context: { source_job_id: jobId, parent_job_id: 'job_workspace_book_review' },
      evidenceId: 'ev_outreach_collab_drafts',
      scopeOutput: '8 leads \u2022 Personalized by role \u2022 Saved to lead list',
      messages: [
        {
          id: 'msg_drafts_welcome',
          role: 'agent',
          timestamp: now,
          content: 'Lead list saved and 8 personalized drafts generated. You can approve/edit per lead, or approve in bulk.',
        },
      ],
    };

    createJobDirect(draftsJob);
    addSpawnedJob(jobId, draftsJobId);

    addAgentMessageWithChips(
      jobId,
      'Done. Lead list saved and drafts generated.\n\n**Saved:** 8 Finance leads \u2192 lead list\n**Created:** Draft reason-for-now outreach (8 leads)\n\u2022 Personalized by role (CFO vs VP Finance vs RevOps)\n\u2022 Sequence: LinkedIn \u2192 email \u2192 follow-ups \u2192 InMail \u2192 nurture\n\u2022 Guardrails: approval required, business hours, stop on any reply\n\nDrafts are in your Needs input queue.',
      [
        'Open drafts for review',
        'Change sequence',
        'Add one more step',
      ]
    );
  }, 800);
}

// Step 7: Personalization → create drafts job
function flowOutreachPersonalizeByRole(jobId: string) {
  setTimeout(() => {
    // Create the drafts job
    const { createJobDirect, addSpawnedJob } = useJobStore.getState();
    const now = new Date().toISOString();
    const draftsJobId = 'job_outreach_drafts_8';

    const draftsJob: Job = {
      id: draftsJobId,
      kind: 'tracked',
      type: 'DRAFT_OUTREACH',
      title: 'Draft reason-for-now outreach (8 leads)',
      status: 'NEEDS_INPUT',
      has_unread_results: true,
      createdAt: now,
      updatedAt: now,
      last_viewed_at: null,
      expires_at: null,
      archived_at: null,
      schedule: null,
      linked_context: { source_job_id: jobId, parent_job_id: 'job_workspace_book_review' },
      evidenceId: 'ev_outreach_collab_drafts',
      scopeOutput: '8 leads \u2022 CRM modernization + RevOps \u2022 Personalized by role',
      messages: [
        {
          id: 'msg_drafts_welcome',
          role: 'agent',
          timestamp: now,
          content: 'Here are your 8 personalized drafts. You can approve/edit per lead, or approve in bulk after a quick skim.',
        },
      ],
    };

    createJobDirect(draftsJob);
    addSpawnedJob(jobId, draftsJobId);

    addAgentMessageWithChips(
      jobId,
      'Done. Drafting now and creating an outreach job with approvals.\n\n**Action created: Draft reason-for-now outreach (8 leads)**\n\u2022 Sequence: LinkedIn \u2192 email \u2192 follow-ups \u2192 InMail \u2192 nurture\n\u2022 Guardrails: approval required, business hours, stop on any reply\n\nI\u2019ll route the drafts to your Needs input queue.',
      [
        'Open drafts for review',
        'Change sequence',
        'Add one more step',
      ]
    );
  }, 800);
}

function flowOutreachOneTemplate(jobId: string) {
  setTimeout(() => {
    // Same as personalize by role but with "one template" note
    const { createJobDirect, addSpawnedJob } = useJobStore.getState();
    const now = new Date().toISOString();
    const draftsJobId = 'job_outreach_drafts_8';

    const draftsJob: Job = {
      id: draftsJobId,
      kind: 'tracked',
      type: 'DRAFT_OUTREACH',
      title: 'Draft reason-for-now outreach (8 leads)',
      status: 'NEEDS_INPUT',
      has_unread_results: true,
      createdAt: now,
      updatedAt: now,
      last_viewed_at: null,
      expires_at: null,
      archived_at: null,
      schedule: null,
      linked_context: { source_job_id: jobId, parent_job_id: 'job_workspace_book_review' },
      evidenceId: 'ev_outreach_collab_drafts',
      scopeOutput: '8 leads \u2022 CRM modernization + RevOps \u2022 Single template',
      messages: [
        {
          id: 'msg_drafts_welcome',
          role: 'agent',
          timestamp: now,
          content: 'Here are your 8 drafts using one template. You can edit per lead or approve in bulk.',
        },
      ],
    };

    createJobDirect(draftsJob);
    addSpawnedJob(jobId, draftsJobId);

    addAgentMessageWithChips(
      jobId,
      'Done. Using one template for all leads.\n\n**Action created: Draft reason-for-now outreach (8 leads)**\n\u2022 Sequence: LinkedIn \u2192 email \u2192 follow-ups \u2192 InMail \u2192 nurture\n\u2022 Guardrails: approval required, business hours, stop on any reply\n\nI\u2019ll route the drafts to your Needs input queue.',
      [
        'Open drafts for review',
        'Change sequence',
        'Add one more step',
      ]
    );
  }, 800);
}

// Step 8: Open drafts for review → navigate to the drafts job
function flowOutreachOpenDrafts(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, 'Opening the draft queue now. You can approve/edit per lead, or approve in bulk after a quick skim.');

    setTimeout(() => {
      setEvidence('ev_outreach_collab_drafts');
      navigateToJob('job_outreach_drafts_8');
    }, 300);
  }, 500);
}

function flowOutreachChangeSequence(jobId: string) {
  setTimeout(() => {
    setEvidence('ev_outreach_collab_plan');
    addAgentMessageWithChips(
      jobId,
      'The sequence builder is open on the right. You can drag steps, change channels, or adjust timing directly. Or tell me what to change.',
      [
        'Keep as-is',
        'Open drafts for review',
      ]
    );
  }, 500);
}

function flowOutreachAddOneMoreStep(jobId: string) {
  const { outreachPlansById, addStep } = useOutreachStore.getState();
  const plan = outreachPlansById[jobId];

  setTimeout(() => {
    if (plan) {
      const lastStep = plan.steps[plan.steps.length - 1];
      addStep(jobId, {
        id: `step_extra_${Date.now().toString(36)}`,
        channel: 'LINKEDIN_MESSAGE',
        dayOffset: (lastStep?.dayOffset || 14) + 3,
        condition: 'IF_NO_REPLY',
        parentStepId: lastStep?.id || null,
        requiresApproval: true,
        label: 'LinkedIn check-in',
      });
    }

    setEvidence('ev_outreach_collab_plan');
    addAgentMessageWithChips(
      jobId,
      'Added a LinkedIn check-in at the end. You can adjust it in the builder on the right.',
      [
        'Open drafts for review',
        'Change sequence',
      ]
    );
  }, 600);
}

// ═══════════════════════════════════════════════════════
// FLOW A: What changed → Steering → Job → Outreach
// ═══════════════════════════════════════════════════════

function flowWhatChanged(jobId: string) {
  setTimeout(() => {
    addAgentMessage(
      jobId,
      '8 accounts changed. Biggest: Acme (VP Sales hire + RevOps hiring spike), Nimbus (new VP RevOps), 2 opp-risk accounts thin on Finance.',
      { attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_2001', label: 'Open changes (8)' }] }
    );
    setEvidence('ev_2001');

    updateJobSuggestions(jobId,
      [
        { id: 'ns_1', title: 'Deprioritize touched accounts and re-rank', why: 'Removes noise from recently-contacted accounts', cta: 'Run', prompt: 'Deprioritize anything touched in last 30 days; weight intent less.' },
        { id: 'ns_2', title: 'Find Finance stakeholders for changed accounts', why: '8 accounts changed \u2014 find the right people now', cta: 'Run', prompt: 'Find Finance stakeholders for the top 8 changed accounts' },
      ],
      [
        { id: 'as_1', question: 'Which accounts have an opp but thin Finance coverage?', why: 'Identifies multithreading gaps in active opportunities' },
      ]
    );
  }, 800);
}

function flowSteering(jobId: string, content: string) {
  const chips: string[] = [];
  const lower = content.toLowerCase();
  if (lower.includes('deprioritize')) chips.push('Deprioritize touched <30d');
  if (lower.includes('weight intent')) chips.push('Weight intent: medium');
  if (chips.length === 0) chips.push('Custom re-rank applied');

  setTimeout(() => {
    const { updateDecisionChips } = useJobStore.getState();
    updateDecisionChips(jobId, chips);

    addAgentMessage(
      jobId,
      'Done. Updated ranking. Want me to find Finance stakeholders for the top 8 changed accounts?',
      {
        attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_2002', label: 'Open ranking (10)' }],
        cardType: 'DECISION_CHIPS',
        cardData: chips,
      }
    );
    setEvidence('ev_2002');

    setTimeout(() => {
      addAgentMessage(jobId, "I'll prioritize CFO/VP Finance and flag coverage gaps across the 8 changed accounts.", {
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Find Finance stakeholders (top 8 changed accounts)',
          jobType: 'FIND_LEADS',
          inputsSummary: ['8 accounts (from "What changed")', 'Personas: CFO, VP Finance, Head of Finance', 'Seniority: VP+'],
          outputsExpected: ['Lead list', 'Coverage gaps', 'Suggested next steps'],
          approvalsNeeded: false,
        },
      });
      updateJobSuggestions(jobId,
        [{ id: 'ns_run', title: 'Run the Finance stakeholder search', why: 'Job configured and ready', cta: 'Run', prompt: 'Yes\u2014run it.' }],
        []
      );
    }, 500);
  }, 1000);
}

function flowRunJob(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, "Started job. I'll drop results here when ready.");
    createAndRunChildJob(jobId, {
      title: 'Find Finance stakeholders (top 8)',
      type: 'FIND_LEADS',
      evidenceId: 'ev_3102',
      stages: ['Scanning accounts', 'Matching personas', 'Ranking leads', 'Checking coverage', 'Complete'],
      scopeOutput: '8 accounts \u2192 14 leads found, 3 coverage gaps',
    }, 3000);

    setTimeout(() => {
      updateJobSuggestions(jobId,
        [
          { id: 'ns_draft', title: 'Draft reason-for-now outreach for top leads', why: '14 leads found \u2014 create personalized messages', cta: 'Run', prompt: 'Draft reason-for-now outreach for the top 8 leads' },
        ],
        [
          { id: 'as_warm', question: 'Which leads have the warmest path?', why: 'Warm intros get 3x response rate' },
        ]
      );
    }, 3200);
  }, 600);
}

// ═══════════════════════════════════════════════════════
// FLOW B: Signal-driven
// ═══════════════════════════════════════════════════════

function flowSignalLeads(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, "Got it. I'll find 12\u201320 leads across Acme with (VP+), (RevOps/Finance), (recent engagement). Run?", {
      cardType: 'JOB_PROPOSAL',
      cardData: {
        jobName: 'Find engaged stakeholders (Acme)',
        jobType: 'FIND_LEADS',
        inputsSummary: ['Account: Acme Software', 'Personas: RevOps, Finance', 'Seniority: VP+', 'Engaged in last 30d'],
        outputsExpected: ['Lead list with match scores', 'Engagement signals', 'Coverage report'],
        approvalsNeeded: false,
      },
    });
    updateJobSuggestions(jobId,
      [{ id: 'ns_run_sig', title: 'Run the lead-find job for Acme', why: 'Search configured for RevOps + Finance VP+', cta: 'Run', prompt: 'Yes\u2014run it.' }],
      [{ id: 'as_topics', question: 'What other topics is Acme surging on besides CRM?', why: 'May reveal additional angles' }]
    );
  }, 800);
}

function flowAddToCampaign(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, 'Added 10 leads to campaign **"Acme CRM Modernization"** and queued 6 reason-for-now drafts for approval.', {
      attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_4202', label: 'Open approval queue (6)' }],
    });
    setEvidence('ev_4202');
    updateJobSuggestions(jobId,
      [{ id: 'ns_review', title: 'Review and approve 6 pending drafts', why: 'Drafts are queued and ready', cta: 'Open', prompt: 'Show me the draft approval queue' }],
      []
    );
  }, 800);
}

// ═══════════════════════════════════════════════════════
// FLOW C: Edit drafts → approve → recurring
// ═══════════════════════════════════════════════════════

function flowEditDrafts(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, 'Updated all 8 drafts with your guidance. Want to approve all, or review first?', {
      attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_4201', label: 'Review updated drafts (8)' }],
    });
    setEvidence('ev_4201');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_approve', title: 'Approve all 8 updated drafts', why: 'All drafts updated \u2014 ready to send', cta: 'Run', prompt: 'Approve all' },
      ],
      [
        { id: 'as_warmer', question: 'Can you make these warmer without losing the signal angle?', why: 'Adjusts tone while keeping personalization' },
      ]
    );
  }, 800);
}

function flowApproveAll(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, 'All drafts approved and ready to send. Want me to queue follow-ups if no response in 4 business days?', {
      cardType: 'JOB_PROPOSAL',
      cardData: {
        jobName: 'Follow-up nudges (LinkedIn)',
        jobType: 'DRAFT_OUTREACH',
        inputsSummary: ['Trigger: no response in 4 business days', 'Channel: LinkedIn only', 'Recurrence: weekly'],
        outputsExpected: ['Auto-generated follow-up drafts', 'Approval queue before sending'],
        approvalsNeeded: true,
      },
    });
    updateJobSuggestions(jobId,
      [{ id: 'ns_recur', title: 'Create recurring follow-up job', why: 'Auto-nudges for non-responders', cta: 'Run', prompt: 'Create the recurring follow-up nudges job' }],
      []
    );
  }, 800);
}

function flowCreateRecurringJob(jobId: string) {
  setTimeout(() => {
    const { createJobDirect, addSpawnedJob } = useJobStore.getState();
    const now = new Date().toISOString();
    const childId = `job_recurring_${Date.now()}`;
    const child: Job = {
      id: childId,
      kind: 'tracked',
      type: 'DRAFT_OUTREACH',
      title: 'Follow-up nudges (LinkedIn)',
      status: 'SCHEDULED',
      has_unread_results: false,
      createdAt: now,
      updatedAt: now,
      last_viewed_at: null,
      expires_at: null,
      archived_at: null,
      schedule: { is_active: true, frequency: 'weekly', dayOfWeek: 'Monday', time: '09:00', next_run_at: '2026-02-17T09:00:00-08:00' },
      linked_context: { parent_job_id: jobId },
      messages: [],
    };
    createJobDirect(child);
    addSpawnedJob(jobId, childId);

    addAgentMessage(jobId, 'Recurring job created: **Follow-up nudges (LinkedIn)**. I\u2019ll check every Monday for non-responders.');
  }, 800);
}

// ═══════════════════════════════════════════════════════
// FLOW D: Multithread / opp
// ═══════════════════════════════════════════════════════

function flowOppCoverage(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, '4 opp accounts are thin on Finance + IT. Want me to generate a multithread plan?', {
      attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_needs_attention_01', label: 'View coverage gaps (4)' }],
    });
    setEvidence('ev_needs_attention_01');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_mt', title: 'Generate multithread plan', why: '4 accounts missing Finance + IT', cta: 'Run', prompt: 'Generate a multithread plan for the 4 opp-risk accounts' },
      ],
      [{ id: 'as_persona', question: 'What personas are missing at each account?', why: 'Shows specific gaps per account' }]
    );
  }, 800);
}

function flowMultithreadPlan(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, "I'll create a multithread plan. I need 2 inputs to proceed:", {
      attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_needs_attention_01', label: 'View needs attention' }],
      cardType: 'JOB_PROPOSAL',
      cardData: {
        jobName: 'Multithread plan (opp risk accounts)',
        jobType: 'MULTITHREAD_PLAN',
        inputsSummary: ['4 opp-risk accounts', 'Needs: CRM opp stage (Stage 2+)', 'Needs: Persona preferences'],
        outputsExpected: ['Stakeholder map per account', 'Recommended next actions'],
        approvalsNeeded: false,
      },
    });
    setEvidence('ev_needs_attention_01');
  }, 800);
}

// ═══════════════════════════════════════════════════════
// GENERIC FLOWS
// ═══════════════════════════════════════════════════════

function flowDraftOutreach(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, "I'll draft personalized outreach based on signal-driven hooks. Each message needs your approval.", {
      cardType: 'JOB_PROPOSAL',
      cardData: {
        jobName: 'Draft outreach for selected leads',
        jobType: 'DRAFT_OUTREACH',
        inputsSummary: ['Leads from recent search', 'Signal-driven personalization', 'Tone: concise'],
        outputsExpected: ['Personalized drafts', 'Signal-based hooks', 'Approval queue'],
        approvalsNeeded: true,
      },
    });
  }, 800);
}

function flowHotAccounts(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, 'Here are the 5 accounts with the strongest signals right now.', {
      attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_2002', label: 'View ranked accounts (5)' }],
    });
    setEvidence('ev_2002');
  }, 800);
}

function flowQuickAdvice(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId,
      'Based on your current signals, here are your 3 best next actions:\n\n1. **Multi-thread Acme Software** \u2014 New VP Sales hire + RevOps expansion.\n2. **Follow up with Northwind** \u2014 Champion engagement up 40%.\n3. **Review Fabrikam AI** \u2014 Series B just announced.\n\nWant me to find leads for any of these?'
    );
  }, 600);
}

function flowShowApprovals(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, 'You have 8 draft messages waiting for approval. Opening the queue now.', {
      attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_4201', label: 'Open approval queue (8)' }],
    });
    setEvidence('ev_4201');
  }, 600);
}

function flowColdStart(jobId: string) {
  setTimeout(() => {
    addAgentMessage(jobId, "I can find 10 accounts with the best wedge opportunities:", {
      cardType: 'JOB_PROPOSAL',
      cardData: {
        jobName: 'Cold start: Find 10 accounts with a wedge',
        jobType: 'PRIORITIZE_ACCOUNTS',
        inputsSummary: ['Territory: West SMB', 'Criteria: intent + hiring + funding', 'Target: 10 accounts'],
        outputsExpected: ['Ranked list with wedge reasons'],
        approvalsNeeded: false,
      },
    });
  }, 800);
}

function flowSignalDetail(jobId: string, content: string) {
  const signal = content.replace(/^tell me more about:\s*/i, '').trim();
  setTimeout(() => {
    addAgentMessage(jobId, `Here's what I know about **${signal}**. Check the detail view on the right to take action.`);
  }, 600);
}

// ═══════════════════════════════════════════════════════
// PRIORITIZE ACCOUNTS → LEAD DISCOVERY FLOW
// ═══════════════════════════════════════════════════════

function flowPrioritizeAccounts(jobId: string) {
  setTimeout(() => {
    addAgentMessage(
      jobId,
      "I'll analyze your territory and prioritize accounts based on buying signals, engagement, and leadership changes. Starting now..."
    );
    setEvidence('ev_prioritize_reasoning');
    updateJobSuggestions(jobId, [], []);
  }, 600);

  // After reasoning animation auto-advances, send results message
  setTimeout(() => {
    addAgentMessage(
      jobId,
      'Done. I analyzed **134 accounts** in your West SMB territory and found **20 with the strongest buying signals**. They\'re ranked by composite signal score.\n\nYou can narrow this down further \u2014 ask me to filter by leadership changes, CRM status, engagement, or anything else.',
      {
        attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_prioritize_accounts', label: 'View prioritized accounts (20)' }],
      }
    );
    updateJobSuggestions(jobId,
      [
        { id: 'ns_leadership', title: 'Filter: leadership changes in last 30 days', why: 'Leadership changes create the best timing for outreach', cta: 'Run', prompt: 'Show me only accounts with leadership changes in the last 30 days' },
      ],
      [
        { id: 'as_crm', question: 'Which of these have existing CRM opportunities?', why: 'Focus on accounts already in your pipeline' },
        { id: 'as_engagement', question: 'Show accounts with high engagement signals', why: 'Engagement indicates active evaluation' },
      ]
    );
  }, 5500);
}

function flowFilterLeadership(jobId: string) {
  // Create evidence view with leadership-change filter pre-applied via appliedFilters
  const { setEvidence: setEv } = useEvidenceStore.getState();
  const baseEvidence = useEvidenceStore.getState().evidenceById['ev_prioritize_accounts'];

  if (baseEvidence && baseEvidence.accountsPrioritized) {
    const matchCount = baseEvidence.accountsPrioritized.filter(
      (a) => a.filterTags.includes('leadership-change') || a.signalType === 'leadership'
    ).length;
    setEv('ev_prioritize_leadership', {
      id: 'ev_prioritize_leadership',
      type: 'ACCOUNTS_PRIORITIZED',
      title: 'Accounts with leadership changes \u2014 last 60 days',
      subtitle: `${matchCount} accounts with recent executive moves (VP+ hired, promoted, or departed)`,
      generatedAt: new Date().toISOString(),
      filterChips: baseEvidence.filterChips || [],
      accountsPrioritized: baseEvidence.accountsPrioritized,
      bookSize: baseEvidence.bookSize,
      appliedFilters: ['leadership-change'],
      findLeadsLabel: 'Find leads in these accounts',
    });
  }

  setTimeout(() => {
    addAgentMessage(
      jobId,
      `Filtered. **12 accounts** had leadership changes in the last 30 days \u2014 new VPs, CROs, and promoted executives. These are high-timing targets.\n\nWant to narrow further? I can also filter to only accounts with **existing CRM opportunities**.`,
      {
        attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_prioritize_leadership', label: 'View leadership changes (12)' }],
      }
    );
    setEvidence('ev_prioritize_leadership');

    updateJobSuggestions(jobId,
      [
        { id: 'ns_crm_filter', title: 'Filter to existing CRM opportunities', why: 'Focus on accounts already in your pipeline', cta: 'Run', prompt: 'Now filter to only accounts with existing opportunities in my CRM' },
        { id: 'ns_find_leads_now', title: 'Find leads in these 12 accounts', why: '12 accounts with leadership changes \u2014 find decision makers', cta: 'Run', prompt: 'Find leads in these accounts' },
      ],
      [
        { id: 'as_signal', question: 'What specific leadership changes happened at each?', why: 'See the details behind each change' },
      ]
    );
  }, 800);
}

function flowFilterCrmOpps(jobId: string) {
  // Create evidence view with CRM filter pre-applied via appliedFilters
  const { setEvidence: setEv } = useEvidenceStore.getState();

  // Get the base evidence (always use the full accounts set)
  const baseEvidence = useEvidenceStore.getState().evidenceById['ev_prioritize_accounts'];
  const leadershipEvidence = useEvidenceStore.getState().evidenceById['ev_prioritize_leadership'];
  const fromLeadership = !!leadershipEvidence;

  // Build the applied filters stack — add CRM on top of any previous filters
  const prevFilters = leadershipEvidence?.appliedFilters || [];
  const appliedFilters = [...prevFilters, 'crm-active'];

  if (baseEvidence && baseEvidence.accountsPrioritized) {
    // Add crm-active tag to relevant accounts so the filter logic picks them up
    const crmOppAccountIds = new Set(['acc_01', 'acc_03', 'acc_06', 'acc_11', 'acc_13', 'acc_18']);
    const accountsWithCrmTag = baseEvidence.accountsPrioritized.map((a) =>
      crmOppAccountIds.has(a.id) && !a.filterTags.includes('crm-active')
        ? { ...a, filterTags: [...a.filterTags, 'crm-active'] }
        : a
    );

    const matchCount = accountsWithCrmTag.filter((a) =>
      appliedFilters.every((f) => a.filterTags.includes(f) || a.signalType === f)
    ).length;

    // Augment filter chips with the CRM chip
    const baseChips = baseEvidence.filterChips || [];
    const crmChip = { id: 'crm-active', label: 'Active CRM opportunity', count: accountsWithCrmTag.filter((a) => a.filterTags.includes('crm-active')).length };
    const chips = baseChips.some((c) => c.id === 'crm-active') ? baseChips : [...baseChips, crmChip];

    setEv('ev_prioritize_crm', {
      id: 'ev_prioritize_crm',
      type: 'ACCOUNTS_PRIORITIZED',
      title: 'Accounts with CRM opportunities + leadership changes',
      subtitle: `${matchCount} accounts with active pipeline and recent executive moves`,
      generatedAt: new Date().toISOString(),
      filterChips: chips,
      accountsPrioritized: accountsWithCrmTag,
      bookSize: baseEvidence.bookSize,
      appliedFilters,
      findLeadsLabel: 'Find leads in these accounts',
    });
  }

  setTimeout(() => {
    const count = fromLeadership ? 4 : 6;

    addAgentMessage(
      jobId,
      `Done. ${fromLeadership ? 'Cross-referenced with your CRM \u2014 ' : ''}**${count} accounts** have both active CRM opportunities and recent leadership changes. These are your highest-priority targets.\n\nReady to find leads in these accounts?`,
      {
        attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_prioritize_crm', label: `View filtered accounts (${count})` }],
      }
    );
    setEvidence('ev_prioritize_crm');

    updateJobSuggestions(jobId,
      [
        { id: 'ns_find_leads_crm', title: `Find leads in these ${count} accounts`, why: 'Active opps + leadership changes = best timing', cta: 'Run', prompt: 'Find leads in these accounts' },
      ],
      []
    );
  }, 800);
}

function flowFindLeadsInAccounts(jobId: string, content: string) {
  // Extract number of accounts from message (e.g., "these 4 prioritized accounts")
  const countMatch = content.match(/(\d+)\s*(prioritized|filtered|account)/i);
  const accountCount = countMatch ? parseInt(countMatch[1]) : 20;

  setTimeout(() => {
    addAgentMessage(
      jobId,
      `Starting lead discovery across **${accountCount} accounts**. I'll scan for decision makers, engagement signals, and warm paths...`
    );
    setEvidence('ev_leads_reasoning');
    updateJobSuggestions(jobId, [], []);
  }, 600);

  // After reasoning animation completes, show the 14 finance leads table (ev_3102)
  setTimeout(() => {
    addAgentMessage(
      jobId,
      `Found **14 leads** across your ${accountCount} accounts \u2014 Finance stakeholders, RevOps leaders, and key decision makers. 3 accounts have coverage gaps where you don\u2019t have an existing contact.\n\nWant me to propose a short outreach plan for these leads?`,
      {
        attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_3102', label: 'View leads (14)' }],
        suggestedChips: [
          'Yes \u2014 suggest a plan',
          'Show me the leads first',
          'What signals are we using?',
        ],
      }
    );
    setEvidence('ev_3102');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_plan', title: 'Suggest an outreach plan for these 14 leads', why: '14 leads found \u2014 propose a sequenced approach', cta: 'Run', prompt: 'Yes \u2014 suggest a plan' },
        { id: 'ns_draft', title: 'Draft outreach for all 14 leads', why: 'Skip planning, go straight to personalized drafts', cta: 'Run', prompt: 'Draft reason-for-now outreach for all 14 leads' },
      ],
      [
        { id: 'as_signals', question: 'What signals are we using?', why: 'Understand the ranking criteria' },
        { id: 'as_gaps', question: 'Which accounts have coverage gaps?', why: '3 accounts missing contacts' },
      ]
    );
  }, 5500);
}

function flowRefineLeads(jobId: string, refinement: 'job_changes' | 'vp_plus' | 'proceed') {
  const { setEvidence: setEv } = useEvidenceStore.getState();
  // Use the latest filtered evidence if available, otherwise the base
  const filteredEvidence = useEvidenceStore.getState().evidenceById['ev_play_leads_filtered'];
  const baseEvidence = filteredEvidence || useEvidenceStore.getState().evidenceById['ev_leads_discovery'];

  if (refinement === 'proceed') {
    // Calculate current visible lead count for the message
    let proceedCount = 25;
    if (baseEvidence?.leadsDiscovery) {
      let vis = baseEvidence.leadsDiscovery;
      for (const f of (baseEvidence.appliedFilters || [])) {
        vis = vis.filter((l: { filterTags: string[] }) => l.filterTags.includes(f));
      }
      proceedCount = vis.length;
    }
    // Advance directly to outreach planning
    setTimeout(() => {
      addAgentMessage(jobId, `Great \u2014 your **${proceedCount} leads** are locked in. Moving to outreach planning now...`);
      updateJobSuggestions(jobId, [], []);
    }, 600);

    // Kick off the outreach plan flow after a brief pause
    setTimeout(() => {
      flowStartOutreachFromLeads(jobId);
    }, 1800);
    return;
  }

  // Apply filter via appliedFilters pattern (same as accounts breadcrumb)
  const filterId = refinement === 'job_changes' ? 'job_changes' : 'vp_plus';
  const filterLabel = refinement === 'job_changes' ? 'job changes' : 'VP level and above';

  if (baseEvidence && baseEvidence.leadsDiscovery) {
    const prevFilters = baseEvidence.appliedFilters || [];
    const appliedFilters = prevFilters.includes(filterId)
      ? prevFilters
      : [...prevFilters, filterId];

    // Calculate the filtered count for the agent message
    let visible = baseEvidence.leadsDiscovery;
    for (const f of appliedFilters) {
      visible = visible.filter((l: { filterTags: string[] }) => l.filterTags.includes(f));
    }

    setEv('ev_play_leads_filtered', {
      id: 'ev_play_leads_filtered',
      type: 'LEADS_DISCOVERY',
      title: `Leads — ${filterLabel}`,
      subtitle: `${visible.length} leads matching your filters`,
      generatedAt: new Date().toISOString(),
      leadsDiscovery: baseEvidence.leadsDiscovery,
      totalLeadsCount: baseEvidence.totalLeadsCount || baseEvidence.leadsDiscovery.length,
      filterChips: baseEvidence.filterChips || [],
      appliedFilters,
    });

    setTimeout(() => {
      const filterDesc = refinement === 'job_changes'
        ? 'prioritizing recent job changes'
        : 'filtering to VP level and above';
      addAgentMessage(jobId, `Filtered to **${visible.length} leads**, ${filterDesc}.`);
      setEvidence('ev_play_leads_filtered');
      updateJobSuggestions(jobId, [], []);
    }, 600);

    // Build remaining filter suggestions
    const allChips = baseEvidence.filterChips || [];
    const remainingFilters = allChips.filter((c: { id: string }) => !appliedFilters.includes(c.id));

    setTimeout(() => {
      const suggestions = remainingFilters.map((c: { id: string; label: string }) => ({
        id: `ns_filter_${c.id}`,
        title: c.label,
        why: `Further narrow by ${c.label.toLowerCase()}`,
        cta: 'Filter',
        prompt: c.id === 'vp_plus' ? 'VP level and above only' : 'Apply those filters — prioritize job changes',
      }));

      addAgentMessage(
        jobId,
        `\u2705 **${visible.length} leads** ready.\n\nWhat would you like to do next?`
      );
      updateJobSuggestions(jobId,
        [
          ...suggestions,
          { id: 'ns_outreach', title: 'Start outreach campaign', why: `Personalized messaging for ${visible.length} leads`, cta: 'Run', prompt: 'Start outreach campaign for these leads' },
        ],
        []
      );
    }, 2200);
  }
}

function flowSaveLeadList(jobId: string) {
  setTimeout(() => {
    addAgentMessage(
      jobId,
      "Lead list saved as **\"Prioritized leads \u2014 West SMB (Feb 10)\"**. I'll track engagement and alert you when any of these leads show new buying signals.\n\nWant me to also draft outreach for the top leads?"
    );
    updateJobSuggestions(jobId,
      [{ id: 'ns_draft_outreach', title: 'Draft outreach for top leads', why: 'Signal-driven personalized messaging', cta: 'Run', prompt: 'Draft reason-for-now outreach for the top 10 leads' }],
      []
    );
  }, 800);
}

function flowStartOutreachFromLeads(jobId: string) {
  // Progress the current play to the outreach plan phase (not a new job)
  const { setEvidence: setEv } = useEvidenceStore.getState();
  const { setPlan } = useOutreachStore.getState();

  // Check for quick play card config
  const job = useJobStore.getState().jobsById[jobId];
  const intentKey = job?.scope?.intentKey || '';
  const cardConfig = CARD_CONFIG[intentKey];

  // Determine the current filtered lead count from the latest leads evidence
  const quickFilteredLeadsEv = useEvidenceStore.getState().evidenceById['ev_quick_leads_filtered'];
  const filteredLeadsEv = useEvidenceStore.getState().evidenceById['ev_play_leads_filtered'];
  const cardLeadsEv = cardConfig ? useEvidenceStore.getState().evidenceById[cardConfig.leadsEvId] : null;
  const baseLeadsEv = useEvidenceStore.getState().evidenceById['ev_leads_discovery'];
  const leadsEvidence = (cardConfig ? quickFilteredLeadsEv : filteredLeadsEv) || cardLeadsEv || baseLeadsEv;

  let leadCount = 25; // fallback
  if (leadsEvidence?.leadsDiscovery) {
    let visible = leadsEvidence.leadsDiscovery;
    const filters = leadsEvidence.appliedFilters || [];
    for (const f of filters) {
      visible = visible.filter((l: { filterTags: string[] }) => l.filterTags.includes(f));
    }
    leadCount = visible.length;
  }

  // Create a default outreach plan in the outreach store for the play job
  const playOutreachPlan = {
    steps: [
      { id: 'play_s1', channel: 'CONNECT_REQUEST' as const, label: 'Connection request', dayOffset: 0, condition: null, parentStepId: null, requiresApproval: true },
      { id: 'play_s2', channel: 'LINKEDIN_MESSAGE' as const, label: 'LinkedIn message', dayOffset: 2, condition: 'IF_CONNECT_ACCEPTED' as const, parentStepId: 'play_s1', requiresApproval: true },
      { id: 'play_s3', channel: 'EMAIL' as const, label: 'Email (reason-for-now)', dayOffset: 3, condition: 'IF_NOT_ACCEPTED' as const, parentStepId: 'play_s1', requiresApproval: true, addToCadence: true },
      { id: 'play_s4', channel: 'INMAIL' as const, label: 'InMail', dayOffset: 5, condition: 'IF_NO_REPLY' as const, parentStepId: 'play_s3', requiresApproval: true },
      { id: 'play_s5', channel: 'EMAIL_FOLLOWUP' as const, label: 'Follow-up email', dayOffset: 8, condition: 'IF_NO_REPLY' as const, parentStepId: 'play_s4', requiresApproval: true },
      { id: 'play_s6', channel: 'NURTURE' as const, label: 'Add to nurture', dayOffset: 12, condition: 'IF_NO_REPLY' as const, parentStepId: 'play_s5', requiresApproval: false },
    ],
    guardrails: { approvalRequired: true, maxSendsPerDay: 20, businessHoursOnly: true, stopOnReply: true },
  };
  setPlan(jobId, playOutreachPlan);

  // Dynamically create an outreach plan evidence for this play's leads
  const outreachEvidenceId = 'ev_prioritize_outreach_plan';
  setEv(outreachEvidenceId, {
    id: outreachEvidenceId,
    type: 'OUTREACH_PLAN_BUILDER',
    title: 'Outreach plan \u2014 Prioritized leads',
    subtitle: `${leadCount} leads \u2022 Signal-driven personalization \u2022 Reason-for-now messaging`,
    generatedAt: new Date().toISOString(),
    context: { jobId },
    leadListId: 'leadlist_west_smb_weekly_01',
    leadCount,
  });

  setTimeout(() => {
    addAgentMessage(
      jobId,
      `Moving to the next phase. I've built an **outreach plan** for your **${leadCount} leads** using the signals we identified \u2014 leadership changes, engagement, and intent data.\n\nReview the plan and adjust the sequence, tone, or channel mix before I draft the messages.`
    );
    setEvidence(outreachEvidenceId);
    updateJobSuggestions(jobId,
      [
        { id: 'ns_approve_plan', title: 'Looks good \u2014 draft the messages', why: `Generate personalized outreach for ${leadCount} leads`, cta: 'Run', prompt: 'Looks good, draft the messages' },
      ],
      [
        { id: 'as_lead_email', question: 'Lead with email on Day 1 instead of a connection request?', why: 'Swap the opening channel for a warmer intro' },
        { id: 'as_skip_inmail', question: 'Drop the InMail step and go straight to follow-up email?', why: 'Simplify the sequence to fewer touchpoints' },
      ]
    );
  }, 800);
}

// ── Sequence manipulation helpers ────────────────────────────────────────

function flowSequenceSwapToEmail(jobId: string) {
  const { setPlan, outreachPlansById } = useOutreachStore.getState();
  const plan = outreachPlansById[jobId];

  if (plan) {
    // Swap: Email on Day 0, Connection request on Day 2
    const updatedSteps = plan.steps.map((s) => {
      if (s.id === 'play_s1') return { ...s, channel: 'EMAIL' as const, label: 'Email (reason-for-now)', addToCadence: true };
      if (s.id === 'play_s2') return { ...s, channel: 'CONNECT_REQUEST' as const, label: 'Connection request', dayOffset: 2, condition: 'IF_NO_REPLY' as const, parentStepId: 'play_s1' };
      if (s.id === 'play_s3') return { ...s, channel: 'EMAIL_FOLLOWUP' as const, label: 'Follow-up email', dayOffset: 4, condition: 'IF_NO_REPLY' as const, parentStepId: 'play_s2' };
      if (s.id === 'play_s4') return { ...s, dayOffset: 6, parentStepId: 'play_s3' };
      if (s.id === 'play_s5') return { ...s, dayOffset: 9, parentStepId: 'play_s4' };
      if (s.id === 'play_s6') return { ...s, dayOffset: 12, parentStepId: 'play_s5' };
      return s;
    });
    setPlan(jobId, { ...plan, steps: updatedSteps });
  }

  setTimeout(() => {
    addAgentMessage(
      jobId,
      "Done \u2014 swapped to **email-first**. The sequence now opens with a reason-for-now email on Day 0, then falls back to a connection request if there\u2019s no reply.\n\nTake a look at the updated sequence on the right."
    );
    setEvidence('ev_prioritize_outreach_plan');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_approve_plan', title: 'Looks good \u2014 draft the messages', why: 'Generate personalized outreach', cta: 'Run', prompt: 'Looks good, draft the messages' },
      ],
      [
        { id: 'as_revert_li', question: 'Go back to leading with a connection request?', why: 'Revert to LinkedIn-first sequence' },
        { id: 'as_add_phone', question: 'Add a phone step after the follow-up email?', why: 'Multi-channel with a phone touchpoint' },
      ]
    );
  }, 600);
}

function flowSequenceDropInmail(jobId: string) {
  const { setPlan, outreachPlansById } = useOutreachStore.getState();
  const plan = outreachPlansById[jobId];

  if (plan) {
    // Remove InMail step and reconnect the chain
    const inmailStep = plan.steps.find(s => s.id === 'play_s4');
    if (inmailStep) {
      // Point children of InMail to its parent
      const updatedSteps = plan.steps
        .filter(s => s.id !== 'play_s4')
        .map(s => {
          if (s.parentStepId === 'play_s4') return { ...s, parentStepId: inmailStep.parentStepId || null };
          return s;
        });
      setPlan(jobId, { ...plan, steps: updatedSteps });
    }
  }

  setTimeout(() => {
    addAgentMessage(
      jobId,
      "Done \u2014 removed the InMail step. The sequence now goes straight from email to follow-up. This keeps it tighter and saves your InMail credits.\n\nReview the updated sequence on the right."
    );
    setEvidence('ev_prioritize_outreach_plan');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_approve_plan', title: 'Looks good \u2014 draft the messages', why: 'Generate personalized outreach', cta: 'Run', prompt: 'Looks good, draft the messages' },
      ],
      [
        { id: 'as_add_inmail_back', question: 'Actually, add InMail back in?', why: 'Re-add the InMail step' },
        { id: 'as_shorten_wait', question: 'Shorten the wait between steps to 1 day?', why: 'Speed up the cadence' },
      ]
    );
  }, 600);
}

function flowSequenceAddInmailBack(jobId: string) {
  const { setPlan, outreachPlansById } = useOutreachStore.getState();
  const plan = outreachPlansById[jobId];

  if (plan) {
    const hasInmail = plan.steps.some(s => s.channel === 'INMAIL');
    if (!hasInmail) {
      // Find the email / follow-up step to insert after
      const emailStep = plan.steps.find(s => s.id === 'play_s3') || plan.steps.find(s => s.channel === 'EMAIL' || s.channel === 'EMAIL_FOLLOWUP');
      const parentId = emailStep?.id || plan.steps[plan.steps.length - 1]?.id || null;
      const parentDay = emailStep?.dayOffset ?? 3;

      // Re-add InMail and shift later steps
      const inmailStep = {
        id: 'play_s4',
        channel: 'INMAIL' as const,
        label: 'InMail',
        dayOffset: parentDay + 2,
        condition: 'IF_NO_REPLY' as const,
        parentStepId: parentId,
        requiresApproval: true,
      };

      // Reconnect children: steps that pointed to the email step now point to InMail
      const updatedSteps = plan.steps.map(s => {
        if (s.parentStepId === parentId && s.id !== 'play_s4' && s.dayOffset > parentDay) {
          return { ...s, parentStepId: 'play_s4' };
        }
        return s;
      });

      setPlan(jobId, { ...plan, steps: [...updatedSteps, inmailStep] });
    }
  }

  setTimeout(() => {
    addAgentMessage(
      jobId,
      "Added InMail back into the sequence. It\u2019ll fire if there\u2019s no reply to the email."
    );
    setEvidence('ev_prioritize_outreach_plan');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_approve_plan', title: 'Looks good \u2014 draft the messages', why: 'Generate personalized outreach', cta: 'Run', prompt: 'Looks good, draft the messages' },
      ],
      [
        { id: 'as_skip_inmail', question: 'Drop the InMail step and go straight to follow-up email?', why: 'Simplify the sequence' },
        { id: 'as_shorten_wait', question: 'Shorten the wait between steps to 1 day?', why: 'Speed up the cadence' },
      ]
    );
  }, 500);
}

function flowSequenceRevertToLinkedIn(jobId: string) {
  const { setPlan, outreachPlansById } = useOutreachStore.getState();
  const plan = outreachPlansById[jobId];

  if (plan) {
    // Reset to the default LinkedIn-first sequence
    const defaultSteps = [
      { id: 'play_s1', channel: 'CONNECT_REQUEST' as const, label: 'Connection request', dayOffset: 0, condition: null, parentStepId: null, requiresApproval: true },
      { id: 'play_s2', channel: 'LINKEDIN_MESSAGE' as const, label: 'LinkedIn message', dayOffset: 2, condition: 'IF_CONNECT_ACCEPTED' as const, parentStepId: 'play_s1', requiresApproval: true },
      { id: 'play_s3', channel: 'EMAIL' as const, label: 'Email (reason-for-now)', dayOffset: 3, condition: 'IF_NOT_ACCEPTED' as const, parentStepId: 'play_s1', requiresApproval: true, addToCadence: true },
      { id: 'play_s4', channel: 'INMAIL' as const, label: 'InMail', dayOffset: 5, condition: 'IF_NO_REPLY' as const, parentStepId: 'play_s3', requiresApproval: true },
      { id: 'play_s5', channel: 'EMAIL_FOLLOWUP' as const, label: 'Follow-up email', dayOffset: 8, condition: 'IF_NO_REPLY' as const, parentStepId: 'play_s4', requiresApproval: true },
      { id: 'play_s6', channel: 'NURTURE' as const, label: 'Add to nurture', dayOffset: 12, condition: 'IF_NO_REPLY' as const, parentStepId: 'play_s5', requiresApproval: false },
    ];
    setPlan(jobId, { ...plan, steps: defaultSteps });
  }

  setTimeout(() => {
    addAgentMessage(
      jobId,
      "Reverted to LinkedIn-first. Connection request on Day 0, then branching from there."
    );
    setEvidence('ev_prioritize_outreach_plan');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_approve_plan', title: 'Looks good \u2014 draft the messages', why: 'Generate personalized outreach', cta: 'Run', prompt: 'Looks good, draft the messages' },
      ],
      [
        { id: 'as_lead_email', question: 'Lead with email on Day 1 instead of a connection request?', why: 'Swap the opening channel' },
        { id: 'as_skip_inmail', question: 'Drop the InMail step and go straight to follow-up email?', why: 'Simplify the sequence' },
      ]
    );
  }, 500);
}

function flowSequenceShortenWait(jobId: string) {
  const { setPlan, outreachPlansById } = useOutreachStore.getState();
  const plan = outreachPlansById[jobId];

  if (plan) {
    // Compress all steps to 1-day gaps
    let day = 0;
    const updatedSteps = plan.steps.map((s, i) => {
      if (i === 0) return { ...s, dayOffset: 0 };
      day += 1;
      return { ...s, dayOffset: day };
    });
    setPlan(jobId, { ...plan, steps: updatedSteps });
  }

  setTimeout(() => {
    addAgentMessage(
      jobId,
      "Tightened the cadence \u2014 each step is now 1 day apart. This is more aggressive but gets through the sequence faster."
    );
    setEvidence('ev_prioritize_outreach_plan');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_approve_plan', title: 'Looks good \u2014 draft the messages', why: 'Generate personalized outreach', cta: 'Run', prompt: 'Looks good, draft the messages' },
      ],
      [
        { id: 'as_spread_out', question: 'Space them out more \u2014 2 days between steps?', why: 'Less aggressive cadence' },
        { id: 'as_skip_inmail', question: 'Drop the InMail step?', why: 'Simplify the sequence' },
      ]
    );
  }, 500);
}

function flowPlayApproveAndSchedule(jobId: string) {
  const { setJobStatus } = useJobStore.getState();
  const { approveAllDrafts } = useOutreachStore.getState();
  const { goHome, setCurrentEvidence: setCurrentEv } = useAppStore.getState();

  // Approve all drafts in the store
  approveAllDrafts();

  // Determine dynamic draft count
  const draftCount = Object.keys(useOutreachStore.getState().draftsById).length || 24;

  setTimeout(() => {
    addAgentMessage(
      jobId,
      `All **${draftCount} drafts** approved and outreach scheduled! I\u2019ll send up to 20 messages per day during business hours, stopping on any reply.\n\nI\u2019ll notify you when leads respond or if anything needs your attention.`
    );
    updateJobSuggestions(jobId, [], []);
  }, 600);

  setTimeout(() => {
    // Transition play to SCHEDULED
    setJobStatus(jobId, 'SCHEDULED');
    const { jobsById } = useJobStore.getState();
    const playJob = jobsById[jobId];
    if (playJob) {
      useJobStore.setState((s) => ({
        jobsById: {
          ...s.jobsById,
          [jobId]: {
            ...playJob,
            status: 'SCHEDULED' as const,
            schedule: {
              is_active: true,
              frequency: 'weekly' as const,
              dayOfWeek: 'Monday',
              time: '09:00',
              next_run_at: '2026-02-17T09:00:00-08:00',
            },
          },
        },
      }));
    }

    // Navigate to home — don't show execution monitor
    goHome();
    setCurrentEv('ev_home');
  }, 2000);
}

function flowPlayDraftMessages(jobId: string) {
  const { setEvidence: setEv } = useEvidenceStore.getState();
  const { setLeads, setDrafts } = useOutreachStore.getState();

  // Check for quick play card config
  const job = useJobStore.getState().jobsById[jobId];
  const intentKey = job?.scope?.intentKey || '';
  const cardConfig = CARD_CONFIG[intentKey];

  // Determine the current filtered lead count
  const quickFilteredLeadsEv = useEvidenceStore.getState().evidenceById['ev_quick_leads_filtered'];
  const filteredLeadsEv = useEvidenceStore.getState().evidenceById['ev_play_leads_filtered'];
  const cardLeadsEv = cardConfig ? useEvidenceStore.getState().evidenceById[cardConfig.leadsEvId] : null;
  const baseLeadsEv = useEvidenceStore.getState().evidenceById['ev_leads_discovery'];
  const leadsEvidence = (cardConfig ? quickFilteredLeadsEv : filteredLeadsEv) || cardLeadsEv || baseLeadsEv;
  let leadCount = 25;
  if (leadsEvidence?.leadsDiscovery) {
    let visible = leadsEvidence.leadsDiscovery;
    for (const f of (leadsEvidence.appliedFilters || [])) {
      visible = visible.filter((l: { filterTags: string[] }) => l.filterTags.includes(f));
    }
    leadCount = visible.length;
  }

  // Populate the outreach store with seed data so drafts render
  setLeads(seedOutreachLeads);
  setDrafts(seedOutreachDrafts);

  // Create a draft review evidence for the play's leads
  const draftsEvidenceId = 'ev_prioritize_outreach_drafts';
  setEv(draftsEvidenceId, {
    id: draftsEvidenceId,
    type: 'OUTREACH_DRAFT_REVIEW',
    title: 'Draft messages — Prioritized leads',
    subtitle: `${leadCount} leads \u2022 Personalized per lead \u2022 Signal-driven hooks`,
    generatedAt: new Date().toISOString(),
    context: { jobId },
    outreachDrafts: seedOutreachDrafts,
  });

  setTimeout(() => {
    addAgentMessage(
      jobId,
      `I've drafted personalized messages for your **${leadCount} leads** across 4 steps: connection request, LinkedIn message, email, and InMail. Each message uses the signals we identified \u2014 leadership changes, engagement patterns, and intent data.\n\nReview and edit any message before sending.`
    );
    setEvidence(draftsEvidenceId);
    updateJobSuggestions(jobId,
      [
        { id: 'ns_approve_all', title: 'Approve all drafts', why: 'Messages look good \u2014 queue them for sending', cta: 'Approve', prompt: 'Approve all drafts' },
      ],
      [
        { id: 'as_tone_direct', question: 'Make the tone more direct', why: 'Shorter, punchier messaging' },
        { id: 'as_add_personal', question: 'Add more personalization', why: 'Reference specific company signals' },
      ]
    );
  }, 800);
}

// ═══════════════════════════════════════════════════════
// PLAY WORKSPACE FLOWS (play_001 deterministic refinements)
// ═══════════════════════════════════════════════════════

/** Leadership change detail data per account */
const LEADERSHIP_CHANGE_DETAILS: Record<string, string> = {
  acc_11: 'New CRO from Salesforce (12 days ago)',
  acc_01: 'VP Finance joined from Snowflake (23 days ago)',
  acc_02: 'VP Revenue Ops hired (18 days ago)',
  acc_03: 'CIO promoted to President, Digital (31 days ago)',
  acc_12: 'VP Sales Ops hired (21 days ago)',
  acc_05: 'New CRO joined (45 days ago)',
  acc_07: 'Finance Director promoted to VP (38 days ago)',
  acc_06: 'VP Marketing Ops joined (52 days ago)',
  acc_08: 'VP Sales Ops joined (28 days ago)',
  acc_09: 'VP Sales joined (15 days ago)',
  acc_16: 'VP RevOps promoted (41 days ago)',
  acc_10: 'VP promoted internally (55 days ago)',
};

/** Last touched dates (some recent, some old) */
const LAST_TOUCHED: Record<string, { daysAgo: number; display: string }> = {
  acc_11: { daysAgo: 5, display: '5 days ago' },
  acc_01: { daysAgo: 42, display: '42 days ago' },
  acc_02: { daysAgo: 67, display: '67 days ago' },
  acc_03: { daysAgo: 91, display: '91 days ago' },
  acc_12: { daysAgo: 33, display: '33 days ago' },
  acc_05: { daysAgo: 14, display: '14 days ago' },
  acc_07: { daysAgo: 120, display: '120 days ago' },
  acc_06: { daysAgo: 8, display: '8 days ago' },
  acc_08: { daysAgo: 55, display: '55 days ago' },
  acc_09: { daysAgo: 38, display: '38 days ago' },
  acc_16: { daysAgo: 78, display: '78 days ago' },
  acc_10: { daysAgo: 22, display: '22 days ago' },
};

function flowPlayLeadershipFilter(jobId: string) {
  const { setEvidence: setEv } = useEvidenceStore.getState();
  const baseEvidence = useEvidenceStore.getState().evidenceById['ev_prioritize_accounts'];

  if (baseEvidence && baseEvidence.accountsPrioritized) {
    // Add leadership change details to ALL accounts (so data persists when breadcrumb filter is removed)
    const allAccountsWithExtra = baseEvidence.accountsPrioritized.map((a) => ({
      ...a,
      extraData: {
        ...(a.extraData || {}),
        ...(LEADERSHIP_CHANGE_DETAILS[a.id] ? { leadership_change: LEADERSHIP_CHANGE_DETAILS[a.id] } : {}),
      },
    }));

    const matchCount = allAccountsWithExtra.filter(
      (a) => a.signalType === 'leadership' || a.filterTags.includes('leadership-change')
    ).length;

    setEv('ev_play_accounts_leadership', {
      id: 'ev_play_accounts_leadership',
      type: 'ACCOUNTS_PRIORITIZED',
      title: 'Accounts with leadership changes \u2014 past 60 days',
      subtitle: `${matchCount} accounts with recent executive moves`,
      generatedAt: new Date().toISOString(),
      filterChips: baseEvidence.filterChips || [],
      accountsPrioritized: allAccountsWithExtra,
      bookSize: baseEvidence.bookSize,
      appliedFilters: ['leadership-change'],
      findLeadsLabel: 'Look for leads from these accounts',
      extraColumns: [
        { id: 'leadership_change', label: 'Leadership Change', width: '260px' },
      ],
    });
  }

  setTimeout(() => {
    addAgentMessage(
      jobId,
      'Filtered. **12 accounts** had leadership changes in the past 60 days \u2014 new VPs, CROs, and promoted executives. I\'ve added a **Leadership Change** column so you can see exactly what happened at each.\n\nWant to narrow further?'
    );
    setEvidence('ev_play_accounts_leadership');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_untouched_30', title: 'Only show me accounts that I haven\'t touched in 30 days', why: 'Focus on accounts you haven\'t contacted recently', cta: 'Filter', prompt: 'Only show me accounts that I haven\'t touched in 30 days' },
      ],
      [
        { id: 'as_find_leads_now', question: 'Look for leads from these accounts', why: '12 accounts with leadership changes \u2014 find decision makers' },
      ]
    );
  }, 800);
}

function flowPlayNotTouched30Filter(jobId: string) {
  const { setEvidence: setEv } = useEvidenceStore.getState();
  // Always build from the original base evidence so we have ALL accounts
  const baseEvidence = useEvidenceStore.getState().evidenceById['ev_prioritize_accounts'];
  const leadershipEvidence = useEvidenceStore.getState().evidenceById['ev_play_accounts_leadership'];

  if (baseEvidence && baseEvidence.accountsPrioritized) {
    // Add Last Touched + Leadership Change extra data to ALL accounts
    const allAccountsWithExtra = baseEvidence.accountsPrioritized.map((a) => ({
      ...a,
      extraData: {
        ...(a.extraData || {}),
        ...(LEADERSHIP_CHANGE_DETAILS[a.id] ? { leadership_change: LEADERSHIP_CHANGE_DETAILS[a.id] } : {}),
        last_touched: LAST_TOUCHED[a.id]?.display || 'Never',
      },
    }));

    // Merge extra columns from leadership step + add Last Touched
    const leadershipCols = leadershipEvidence?.extraColumns || [];
    const hasLastTouched = leadershipCols.some((c) => c.id === 'last_touched');
    const extraColumns = hasLastTouched
      ? leadershipCols
      : [...leadershipCols, { id: 'last_touched', label: 'Last Touched', width: '140px' }];

    // Stack filters: leadership-change + not-touched-30d
    const prevFilters = leadershipEvidence?.appliedFilters || ['leadership-change'];
    const appliedFilters = prevFilters.includes('not-touched-30d')
      ? prevFilters
      : [...prevFilters, 'not-touched-30d'];

    setEv('ev_play_accounts_untouched', {
      id: 'ev_play_accounts_untouched',
      type: 'ACCOUNTS_PRIORITIZED',
      title: 'Untouched accounts with leadership changes',
      subtitle: `Accounts not contacted in 30+ days with recent executive moves`,
      generatedAt: new Date().toISOString(),
      filterChips: baseEvidence.filterChips || [],
      accountsPrioritized: allAccountsWithExtra,
      bookSize: baseEvidence.bookSize,
      appliedFilters,
      findLeadsLabel: 'Look for leads from these accounts',
      extraColumns,
    });
  }

  setTimeout(() => {
    addAgentMessage(
      jobId,
      'Narrowed to **8 accounts** you haven\'t touched in 30+ days \u2014 all with recent leadership changes. Added a **Last Touched** column. These are your best timing plays.\n\nReady to find leads in these accounts?'
    );
    setEvidence('ev_play_accounts_untouched');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_find_leads_play', title: 'Look for leads from these accounts', why: '8 untouched accounts with leadership changes \u2014 best timing', cta: 'Find', prompt: 'Look for leads from these accounts' },
      ],
      []
    );
  }, 800);
}

function flowPlayFindLeads(jobId: string) {
  // Check if this is a quick play with card-specific evidence
  const job = useJobStore.getState().jobsById[jobId];
  const intentKey = job?.scope?.intentKey || '';
  const cardConfig = CARD_CONFIG[intentKey];

  // Get whatever filtered account list is currently showing
  const cardAccountsEv = cardConfig ? useEvidenceStore.getState().evidenceById[cardConfig.accountsEvId] : null;
  const untouched = useEvidenceStore.getState().evidenceById['ev_play_accounts_untouched'];
  const leadership = useEvidenceStore.getState().evidenceById['ev_play_accounts_leadership'];
  const base = useEvidenceStore.getState().evidenceById['ev_prioritize_accounts'];
  const currentEvidence = cardAccountsEv || untouched || leadership || base;

  // Calculate visible count after appliedFilters (mirrors breadcrumb logic)
  let visibleAccounts = currentEvidence?.accountsPrioritized || [];
  const filters = currentEvidence?.appliedFilters || [];
  for (const f of filters) {
    visibleAccounts = visibleAccounts.filter(
      (a) => a.filterTags.includes(f) || a.signalType === f
    );
  }
  const accountCount = visibleAccounts.length || 8;

  // Determine which leads evidence to auto-advance to
  const leadsAutoAdvanceId = cardConfig?.leadsEvId || 'ev_leads_discovery';
  const leadsReasoningId = cardConfig ? cardConfig.leadsReasoningEvId : 'ev_play_leads_reasoning';

  // Create a play-specific reasoning animation that auto-advances to leads_discovery
  const { setEvidence: setEv } = useEvidenceStore.getState();
  setEv(leadsReasoningId, {
    id: leadsReasoningId,
    type: 'REASONING_ANIMATION',
    title: 'Finding leads in prioritized accounts',
    subtitle: `Scanning ${accountCount} accounts for decision makers`,
    generatedAt: new Date().toISOString(),
    reasoningSteps: [
      { label: 'Scanning prioritized accounts', duration: 1500, icon: 'search' },
      { label: 'Identifying key decision makers', duration: 1500, icon: 'users' },
      { label: 'Analyzing engagement signals', duration: 1500, icon: 'chart' },
    ],
    reasoningAutoAdvanceEvidenceId: leadsAutoAdvanceId,
  });

  setTimeout(() => {
    addAgentMessage(
      jobId,
      `Starting lead discovery across **${accountCount} accounts**. Scanning for decision makers, engagement signals, and warm paths...`
    );
    setEvidence(leadsReasoningId);
    // Clear suggestions during reasoning
    updateJobSuggestions(jobId, [], []);
  }, 600);

  // After reasoning animation completes, send results message and update suggestions
  setTimeout(() => {
    // For quick play cards with lead pre-filters, count reflects the pre-filtered set
    const leadsEvData = useEvidenceStore.getState().evidenceById[leadsAutoAdvanceId];
    const preLeadFilters = leadsEvData?.appliedFilters || [];
    const leadsCount = countVisibleLeads(leadsAutoAdvanceId) || 40;

    // Build a contextual description based on what's pre-filtered
    const hasFnSales = preLeadFilters.includes('fn-sales');
    const leadDescriptor = hasFnSales
      ? 'Sales leaders and decision makers'
      : 'Finance stakeholders, RevOps leaders, and key decision makers';

    addAgentMessage(
      jobId,
      `Found **${leadsCount} ${hasFnSales ? 'Sales leads' : 'leads'}** across your ${accountCount} accounts — ${leadDescriptor}.\n\nYou can refine the list from here, or proceed to outreach planning.`
    );

    // For quick play, use discovery questions; for regular play, use existing suggestions
    if (cardConfig) {
      const nextQ = getNextLeadDiscoveryQuestion(preLeadFilters, intentKey);
      if (nextQ) {
        updateJobSuggestions(jobId,
          nextQ.suggestions.map(s => ({ ...s, why: `Narrow by ${nextQ.dimension}` })),
          [
            { id: 'as_proceed', question: 'Looks good — let\'s proceed', why: `Move to outreach planning with these ${leadsCount} leads` },
          ]
        );
      } else {
        updateJobSuggestions(jobId,
          [
            { id: 'ns_filter_job_changes', title: 'Prioritize job changes', why: 'Job changes create the best timing for outreach', cta: 'Filter', prompt: 'Apply those filters — prioritize job changes' },
            { id: 'ns_outreach', title: 'Start outreach campaign', why: `Personalized messaging for ${leadsCount} leads`, cta: 'Run', prompt: 'Start outreach campaign for these leads' },
          ],
          [
            { id: 'as_proceed', question: 'Looks good — let\'s proceed', why: `Move to outreach planning with these ${leadsCount} leads` },
          ]
        );
      }
    } else {
      updateJobSuggestions(jobId,
        [
          { id: 'ns_filter_job_changes', title: 'Apply those filters — prioritize job changes', why: 'Job changes create the best timing for outreach', cta: 'Filter', prompt: 'Apply those filters — prioritize job changes' },
          { id: 'ns_vp_plus', title: 'VP level and above only', why: 'Focus on senior decision makers', cta: 'Filter', prompt: 'VP level and above only' },
        ],
        [
          { id: 'as_proceed', question: 'Looks good — let\'s proceed', why: `Move to outreach planning with these ${leadsCount} leads` },
        ]
      );
    }
  }, 5500);
}

// ═══════════════════════════════════════════════════════
// QUICK PLAY: Guided Discovery Flow
// ═══════════════════════════════════════════════════════

/** Card configuration for discovery flow */
interface CardConfig {
  reasoningEvId: string;
  accountsEvId: string;
  leadsReasoningEvId: string;
  leadsEvId: string;
  preFilters: string[];       // Pre-applied account-level filters
  leadPreFilters: string[];   // Pre-known lead-level dimensions (function/seniority)
  openingMessage: string;
  playTitle: string;
}

const CARD_CONFIG: Record<string, CardConfig> = {
  ai_growth_bay: {
    reasoningEvId: 'ev_quick_ai_growth_reasoning',
    accountsEvId: 'ev_quick_ai_growth_accounts',
    leadsReasoningEvId: 'ev_quick_ai_growth_leads_reasoning',
    leadsEvId: 'ev_quick_ai_growth_leads',
    preFilters: ['region-bay-area', 'industry-ai'],
    leadPreFilters: ['fn-sales'],   // Card implies "Sales leaders"
    openingMessage: "I found **{count} AI companies** in the Bay Area with active buying signals. They're ranked by composite score on the right.\n\nLet's narrow this down — what size companies are you targeting?",
    playTitle: 'AI growth — Bay Area',
  },
  midsize_software_na: {
    reasoningEvId: 'ev_quick_midsize_sw_reasoning',
    accountsEvId: 'ev_quick_midsize_sw_accounts',
    leadsReasoningEvId: 'ev_quick_midsize_sw_leads_reasoning',
    leadsEvId: 'ev_quick_midsize_sw_leads',
    preFilters: ['industry-saas'],
    leadPreFilters: [],   // "Decision makers" — function unknown
    openingMessage: "I found **{count} software companies** with buying signals. They're ranked by intent on the right.\n\nWhich region should we focus on?",
    playTitle: 'Mid-size software — NA',
  },
  growing_sales_teams: {
    reasoningEvId: 'ev_quick_hiring_gtm_reasoning',
    accountsEvId: 'ev_quick_hiring_gtm_accounts',
    leadsReasoningEvId: 'ev_quick_hiring_gtm_leads_reasoning',
    leadsEvId: 'ev_quick_hiring_gtm_leads',
    preFilters: ['hiring-surge'],
    leadPreFilters: ['fn-sales'],   // Card implies "GTM/Sales"
    openingMessage: "I found **{count} companies** actively hiring GTM roles. These are high-intent targets — expanding sales teams often means new tool evaluations.\n\nWhich region should we focus on first?",
    playTitle: 'Companies hiring GTM',
  },
  recent_funding: {
    reasoningEvId: 'ev_quick_funded_reasoning',
    accountsEvId: 'ev_quick_funded_accounts',
    leadsReasoningEvId: 'ev_quick_funded_leads_reasoning',
    leadsEvId: 'ev_quick_funded_leads',
    preFilters: ['recent-funding'],
    leadPreFilters: [],   // "Founders + GTM heads" — function unknown
    openingMessage: "I found **{count} recently funded companies** (Series A–C). Post-funding is prime time for new tool investments.\n\nWhich region should we focus on?",
    playTitle: 'Recent funding (A–C)',
  },
};

/** Maps dimension prefixes to readable labels */
const DIMENSION_LABELS: Record<string, string> = {
  'region-bay-area': 'Bay Area',
  'region-west': 'West Coast',
  'region-northeast': 'Northeast',
  'region-south': 'South',
  'region-midwest': 'Midwest',
  'industry-ai': 'AI/ML',
  'industry-saas': 'SaaS',
  'industry-fintech': 'FinTech',
  'industry-healthtech': 'HealthTech',
  'industry-enterprise-sw': 'Enterprise Software',
  'industry-cloud': 'Cloud',
  'size-startup': '1–50 employees',
  'size-small': '51–200 employees',
  'size-midsize': '201–500 employees',
  'size-growth': '501–1,000 employees',
  'size-enterprise': '1,000+ employees',
  'fn-sales': 'Sales',
  'fn-finance': 'Finance',
  'fn-revops': 'RevOps',
  'fn-engineering': 'Engineering',
  'fn-marketing': 'Marketing',
  'fn-c-suite': 'C-Suite',
  'seniority-vp-plus': 'VP and above',
  'seniority-director': 'Director',
  'seniority-manager': 'Manager',
  'leadership-change': 'Leadership changes',
  'recent-funding': 'Recent funding',
  'hiring-surge': 'Hiring surge',
  'not-touched-30d': 'Not touched in 30 days',
};

/** Determine the next discovery question for accounts based on applied filters */
function getNextAccountDiscoveryQuestion(
  appliedFilters: string[],
  intentKey: string
): { dimension: string; message: string; suggestions: { id: string; title: string; cta: string; prompt: string }[] } | null {
  const hasRegion = appliedFilters.some(f => f.startsWith('region-'));
  const hasIndustry = appliedFilters.some(f => f.startsWith('industry-'));
  const hasSize = appliedFilters.some(f => f.startsWith('size-'));

  // Card-specific skip logic
  const config = CARD_CONFIG[intentKey];
  const preHasRegion = config?.preFilters.some(f => f.startsWith('region-')) || false;
  const preHasIndustry = config?.preFilters.some(f => f.startsWith('industry-')) || false;
  const preHasSize = config?.preFilters.some(f => f.startsWith('size-')) || false;

  if (!hasRegion && !preHasRegion) {
    return {
      dimension: 'region',
      message: "Which region should we focus on?",
      suggestions: [
        { id: 'ns_region_bay', title: 'Bay Area', cta: 'Filter', prompt: 'Focus on Bay Area companies' },
        { id: 'ns_region_west', title: 'West Coast', cta: 'Filter', prompt: 'Focus on West Coast companies' },
        { id: 'ns_region_ne', title: 'Northeast', cta: 'Filter', prompt: 'Focus on Northeast companies' },
        { id: 'ns_region_south', title: 'South', cta: 'Filter', prompt: 'Focus on companies in the South' },
        { id: 'ns_region_mw', title: 'Midwest', cta: 'Filter', prompt: 'Focus on Midwest companies' },
      ],
    };
  }

  if (!hasIndustry && !preHasIndustry) {
    return {
      dimension: 'industry',
      message: "Any particular industry vertical?",
      suggestions: [
        { id: 'ns_ind_ai', title: 'AI/ML', cta: 'Filter', prompt: 'Focus on AI/ML companies' },
        { id: 'ns_ind_saas', title: 'SaaS', cta: 'Filter', prompt: 'Focus on SaaS companies' },
        { id: 'ns_ind_fintech', title: 'FinTech', cta: 'Filter', prompt: 'Focus on FinTech companies' },
        { id: 'ns_ind_health', title: 'HealthTech', cta: 'Filter', prompt: 'Focus on HealthTech companies' },
        { id: 'ns_ind_entsw', title: 'Enterprise Software', cta: 'Filter', prompt: 'Focus on Enterprise Software companies' },
      ],
    };
  }

  if (!hasSize && !preHasSize) {
    return {
      dimension: 'size',
      message: "What size companies are you targeting?",
      suggestions: [
        { id: 'ns_size_startup', title: '1–50 employees', cta: 'Filter', prompt: 'Focus on startups with 1–50 employees' },
        { id: 'ns_size_small', title: '51–200', cta: 'Filter', prompt: 'Focus on companies with 51–200 employees' },
        { id: 'ns_size_mid', title: '201–500', cta: 'Filter', prompt: 'Focus on mid-size companies, 201–500 employees' },
        { id: 'ns_size_growth', title: '501–1,000', cta: 'Filter', prompt: 'Focus on growth-stage companies, 501–1,000 employees' },
        { id: 'ns_size_enterprise', title: '1,000+', cta: 'Filter', prompt: 'Focus on enterprise companies, 1,000+ employees' },
      ],
    };
  }

  // All dimensions answered → transition to signal filters
  return null;
}

/** Determine the next discovery question for leads based on applied filters */
function getNextLeadDiscoveryQuestion(
  appliedFilters: string[],
  intentKey: string
): { dimension: string; message: string; suggestions: { id: string; title: string; cta: string; prompt: string }[] } | null {
  const hasFunction = appliedFilters.some(f => f.startsWith('fn-'));
  const hasSeniority = appliedFilters.some(f => f.startsWith('seniority-'));

  // Card-specific: Card 1 and Card 3 already know function (Sales/GTM) via leadPreFilters
  const config = CARD_CONFIG[intentKey];
  const preHasFunction = config?.leadPreFilters.some(f => f.startsWith('fn-')) || false;

  if (!hasFunction && !preHasFunction) {
    return {
      dimension: 'function',
      message: "Which function should we focus on?",
      suggestions: [
        { id: 'ns_fn_sales', title: 'Sales', cta: 'Filter', prompt: 'Focus on Sales leaders' },
        { id: 'ns_fn_finance', title: 'Finance', cta: 'Filter', prompt: 'Focus on Finance leaders' },
        { id: 'ns_fn_revops', title: 'RevOps', cta: 'Filter', prompt: 'Focus on RevOps leaders' },
        { id: 'ns_fn_csuite', title: 'C-Suite', cta: 'Filter', prompt: 'Focus on C-Suite executives' },
        { id: 'ns_fn_eng', title: 'Engineering', cta: 'Filter', prompt: 'Focus on Engineering leaders' },
      ],
    };
  }

  if (!hasSeniority) {
    return {
      dimension: 'seniority',
      message: "What seniority level are you targeting?",
      suggestions: [
        { id: 'ns_sen_vp', title: 'VP and above', cta: 'Filter', prompt: 'VP level and above only' },
        { id: 'ns_sen_dir', title: 'Director+', cta: 'Filter', prompt: 'Director level and above' },
        { id: 'ns_sen_mgr', title: 'Manager+', cta: 'Filter', prompt: 'Manager level and above' },
      ],
    };
  }

  // All lead dimensions answered
  return null;
}

/** Count visible accounts after applying filters */
function countVisibleAccounts(accountsEvId: string): number {
  const ev = useEvidenceStore.getState().evidenceById[accountsEvId];
  if (!ev?.accountsPrioritized) return 0;
  let visible = ev.accountsPrioritized;
  for (const f of (ev.appliedFilters || [])) {
    visible = visible.filter((a: { filterTags: string[]; signalType?: string }) => a.filterTags.includes(f) || a.signalType === f);
  }
  return visible.length;
}

/** Count visible leads after applying filters */
function countVisibleLeads(leadsEvId: string): number {
  const ev = useEvidenceStore.getState().evidenceById[leadsEvId];
  if (!ev?.leadsDiscovery) return 0;
  let visible = ev.leadsDiscovery;
  for (const f of (ev.appliedFilters || [])) {
    visible = visible.filter((l: { filterTags: string[] }) => l.filterTags.includes(f));
  }
  return visible.length;
}

/** Called after reasoning animation to set up the first discovery question */
function flowQuickPlayStart(jobId: string, intentKey: string) {
  const config = CARD_CONFIG[intentKey];
  if (!config) return;

  // Calculate visible account count after pre-filters
  const count = countVisibleAccounts(config.accountsEvId);
  const message = config.openingMessage.replace('{count}', String(count));

  // Determine the first discovery question
  const nextQ = getNextAccountDiscoveryQuestion(config.preFilters, intentKey);

  setTimeout(() => {
    addAgentMessage(jobId, message);
    setEvidence(config.accountsEvId);

    if (nextQ) {
      updateJobSuggestions(jobId,
        nextQ.suggestions.map(s => ({ ...s, why: `Narrow by ${nextQ.dimension}` })),
        [
          { id: 'as_skip_disc', question: 'Skip — show me signals directly', why: 'Jump ahead to signal-based filtering' },
        ]
      );
    } else {
      // All dimensions covered by pre-filters — go straight to signal suggestions
      transitionToSignalFilters(jobId, intentKey);
    }
  }, 600);
}

/** Apply a discovery filter to accounts and ask the next question */
function flowDiscoverAccountDimension(jobId: string, filterTag: string) {
  const { updateEvidence } = useEvidenceStore.getState();
  const job = useJobStore.getState().jobsById[jobId];
  const intentKey = job?.scope?.intentKey || '';
  const config = CARD_CONFIG[intentKey];
  if (!config) return;

  const accountsEvId = config.accountsEvId;
  const ev = useEvidenceStore.getState().evidenceById[accountsEvId];
  if (!ev) return;

  const prevFilters = ev.appliedFilters || config.preFilters;
  const appliedFilters = prevFilters.includes(filterTag) ? prevFilters : [...prevFilters, filterTag];

  // Update evidence in place with the new filter
  updateEvidence(accountsEvId, { appliedFilters });

  // Calculate new visible count
  let visible = ev.accountsPrioritized || [];
  for (const f of appliedFilters) {
    visible = visible.filter((a: { filterTags: string[]; signalType?: string }) => a.filterTags.includes(f) || a.signalType === f);
  }
  const visCount = visible.length;
  const filterLabel = DIMENSION_LABELS[filterTag] || filterTag;

  // Ask the next question
  const nextQ = getNextAccountDiscoveryQuestion(appliedFilters, intentKey);

  setTimeout(() => {
    if (nextQ) {
      addAgentMessage(
        jobId,
        `Narrowed to **${visCount} accounts** in ${filterLabel}. ${nextQ.message}`
      );
      setEvidence(accountsEvId);
      updateJobSuggestions(jobId,
        nextQ.suggestions.map(s => ({ ...s, why: `Narrow by ${nextQ.dimension}` })),
        [
          { id: 'as_skip_disc', question: 'Skip — show me signals directly', why: 'Jump ahead to signal-based filtering' },
        ]
      );
    } else {
      // All discovery dimensions answered → transition to signal filters
      addAgentMessage(
        jobId,
        `Great — **${visCount} accounts** match your criteria. Now let's apply signal-based filters to identify the highest-intent targets.`
      );
      setEvidence(accountsEvId);
      transitionToSignalFilters(jobId, intentKey);
    }
  }, 600);
}

/** After all discovery dimensions are answered, show signal-based filter suggestions */
function transitionToSignalFilters(jobId: string, intentKey: string) {
  const config = CARD_CONFIG[intentKey];
  if (!config) return;

  updateJobSuggestions(jobId,
    [
      { id: 'ns_sig_leadership', title: 'Leadership changes in last 60 days', why: 'New executives create timing for outreach', cta: 'Filter', prompt: 'Show me only accounts with leadership changes in the past 60 days' },
      { id: 'ns_sig_untouched', title: 'Not touched in 30 days', why: 'Focus on accounts you haven\'t contacted recently', cta: 'Filter', prompt: 'Only show me accounts that I haven\'t touched in 30 days' },
    ],
    [
      { id: 'as_find_leads_now', question: 'Skip signals — find leads now', why: 'Go straight to lead discovery' },
    ]
  );
}

/** Apply a discovery filter to leads and ask the next question */
function flowDiscoverLeadDimension(jobId: string, filterTag: string) {
  const { setEvidence: setEv } = useEvidenceStore.getState();
  const job = useJobStore.getState().jobsById[jobId];
  const intentKey = job?.scope?.intentKey || '';
  const config = CARD_CONFIG[intentKey];

  // Find the current leads evidence (card-specific or the filtered one)
  const quickFilteredEv = useEvidenceStore.getState().evidenceById['ev_quick_leads_filtered'];
  const filteredLeadsEv = useEvidenceStore.getState().evidenceById['ev_play_leads_filtered'];
  const cardLeadsEvId = config?.leadsEvId;
  const cardLeadsEv = cardLeadsEvId ? useEvidenceStore.getState().evidenceById[cardLeadsEvId] : null;
  const baseLeadsEv = useEvidenceStore.getState().evidenceById['ev_leads_discovery'];
  const leadsEvidence = (config ? quickFilteredEv : filteredLeadsEv) || cardLeadsEv || baseLeadsEv;

  if (!leadsEvidence?.leadsDiscovery) return;

  const prevFilters = leadsEvidence.appliedFilters || [];
  const appliedFilters = prevFilters.includes(filterTag) ? prevFilters : [...prevFilters, filterTag];

  // Create or update the filtered leads evidence — keep quick play prefix when applicable
  const filteredLeadsId = config ? 'ev_quick_leads_filtered' : 'ev_play_leads_filtered';
  setEv(filteredLeadsId, {
    id: filteredLeadsId,
    type: 'LEADS_DISCOVERY',
    title: `Leads — filtered`,
    subtitle: `Leads matching your criteria`,
    generatedAt: new Date().toISOString(),
    leadsDiscovery: leadsEvidence.leadsDiscovery,
    totalLeadsCount: leadsEvidence.totalLeadsCount || leadsEvidence.leadsDiscovery.length,
    filterChips: leadsEvidence.filterChips || [],
    appliedFilters,
    outreachLabel: 'Plan Outreach',
  });

  // Calculate visible
  let visible = leadsEvidence.leadsDiscovery;
  for (const f of appliedFilters) {
    visible = visible.filter((l: { filterTags: string[] }) => l.filterTags.includes(f));
  }
  const visCount = visible.length;
  const filterLabel = DIMENSION_LABELS[filterTag] || filterTag;

  // Next lead discovery question
  const nextQ = getNextLeadDiscoveryQuestion(appliedFilters, intentKey);

  setTimeout(() => {
    if (nextQ) {
      addAgentMessage(
        jobId,
        `Filtered to **${visCount} leads** — ${filterLabel}. ${nextQ.message}`
      );
      setEvidence(filteredLeadsId);
      updateJobSuggestions(jobId,
        nextQ.suggestions.map(s => ({ ...s, why: `Narrow by ${nextQ.dimension}` })),
        [
          { id: 'as_skip_lead_disc', question: 'Skip — proceed to outreach', why: 'Move to outreach planning' },
        ]
      );
    } else {
      // All lead dimensions answered → show signal filters for leads, then outreach
      addAgentMessage(
        jobId,
        `✅ **${visCount} leads** match your criteria.\n\nWhat would you like to do next?`
      );
      setEvidence(filteredLeadsId);
      updateJobSuggestions(jobId,
        [
          { id: 'ns_filter_job_changes', title: 'Prioritize job changes', why: 'Job changes create the best timing for outreach', cta: 'Filter', prompt: 'Apply those filters — prioritize job changes' },
          { id: 'ns_outreach', title: 'Start outreach campaign', why: `Personalized messaging for ${visCount} leads`, cta: 'Run', prompt: 'Start outreach campaign for these leads' },
        ],
        [
          { id: 'as_proceed', question: 'Looks good — let\'s proceed', why: 'Move to outreach planning' },
        ]
      );
    }
  }, 600);
}

// ═══════════════════════════════════════════════════════
// GENERIC FALLBACK
// ═══════════════════════════════════════════════════════

function flowGeneric(jobId: string, _content: string) {
  setTimeout(() => {
    addAgentMessage(jobId, "I understand. Based on your book, I'd recommend a prioritization review. Want to see what changed recently, or jump to lead finding?");
    updateJobSuggestions(jobId,
      [
        { id: 'ns_gen_1', title: 'Show what changed since last week', why: 'Recent exec moves, intent spikes, hiring', cta: 'Open', prompt: 'What changed in my book since last week?' },
        { id: 'ns_gen_2', title: 'Find leads for top accounts', why: 'Skip review \u2014 go straight to lead finding', cta: 'Run', prompt: 'Find Finance and RevOps leads for my top 5 accounts' },
      ],
      []
    );
  }, 600);
}
