import { useJobStore } from '../store/useJobStore';
import { useAppStore } from '../store/useAppStore';
import { useEvidenceStore } from '../store/useEvidenceStore';
import { useOutreachStore } from '../store/useOutreachStore';
import { emailFirstPlan, linkedInFirstPlan } from '../data/outreachLeads';

import type { Message } from '../types/thread';
import type { Job } from '../types/job';

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
  if (lower.includes('approve all')) {
    flowApproveAll(jobId);
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
  if (lower.includes('vp level') || lower.includes('vp and above')) {
    flowRefineLeads(jobId, 'vp_plus');
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
    setJobStatus(childId, 'COMPLETED');
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
    const root = steps[0];
    const isLinkedInFirst = root?.channel === 'CONNECT_REQUEST';

    const stepLines = steps.map((s, i) => {
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
  const { setPlan, outreachPlansById } = useOutreachStore.getState();

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
      status: 'COMPLETED',
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
  // Dynamically create a filtered evidence view for leadership changes
  const { setEvidence: setEv } = useEvidenceStore.getState();
  const baseEvidence = useEvidenceStore.getState().evidenceById['ev_prioritize_accounts'];

  if (baseEvidence && baseEvidence.accountsPrioritized) {
    const filtered = baseEvidence.accountsPrioritized.filter(
      (a) => a.filterTags.includes('leadership-change')
    );
    setEv('ev_prioritize_leadership', {
      id: 'ev_prioritize_leadership',
      type: 'ACCOUNTS_PRIORITIZED',
      title: 'Accounts with leadership changes \u2014 last 30 days',
      subtitle: `${filtered.length} accounts with recent executive moves (VP+ hired, promoted, or departed)`,
      generatedAt: new Date().toISOString(),
      filterChips: [],
      accountsPrioritized: filtered,
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
  // Dynamically create a filtered evidence view for CRM opportunities
  const { setEvidence: setEv } = useEvidenceStore.getState();

  // Get whatever is currently shown (could be full list or leadership-filtered)
  const leadershipEvidence = useEvidenceStore.getState().evidenceById['ev_prioritize_leadership'];
  const baseEvidence = leadershipEvidence || useEvidenceStore.getState().evidenceById['ev_prioritize_accounts'];

  // CRM Active Opportunity accounts
  const crmOppAccountIds = new Set(['acc_01', 'acc_03', 'acc_06', 'acc_11', 'acc_13', 'acc_18']);

  if (baseEvidence && baseEvidence.accountsPrioritized) {
    const filtered = baseEvidence.accountsPrioritized.filter(
      (a) => crmOppAccountIds.has(a.id)
    );
    setEv('ev_prioritize_crm', {
      id: 'ev_prioritize_crm',
      type: 'ACCOUNTS_PRIORITIZED',
      title: 'Accounts with CRM opportunities + leadership changes',
      subtitle: `${filtered.length} accounts with active pipeline and recent executive moves`,
      generatedAt: new Date().toISOString(),
      filterChips: [],
      accountsPrioritized: filtered,
      findLeadsLabel: 'Find leads in these accounts',
    });
  }

  setTimeout(() => {
    // Count depends on whether we're filtering from leadership or full
    const fromLeadership = !!leadershipEvidence;
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
  setTimeout(() => {
    if (refinement === 'proceed') {
      addAgentMessage(jobId, "Great! Your list of **25 leads** is ready as-is. Here's what I recommend next:");
    } else {
      const filterDesc = refinement === 'job_changes'
        ? 'prioritizing recent job changes and strong engagement signals'
        : 'filtering to VP level and above';
      addAgentMessage(jobId, `Perfect! I've updated the lead list, ${filterDesc}.`);
    }
    updateJobSuggestions(jobId, [], []);
  }, 600);

  setTimeout(() => {
    addAgentMessage(
      jobId,
      "\u2705 Your final list of **25 leads** is ready!\n\n**Recommended next steps:**\n\u2022 **Save this list** to track engagement and outcomes over time\n\u2022 **Start an outreach campaign** with personalized messaging based on the signals we identified\n\nWhat would you like to do?"
    );
    setEvidence('ev_leads_final');
    updateJobSuggestions(jobId,
      [
        { id: 'ns_save', title: 'Save this lead list', why: 'Track engagement and outcomes over time', cta: 'Save', prompt: 'Save this lead list' },
        { id: 'ns_outreach', title: 'Start outreach campaign', why: 'Personalized messaging based on signals', cta: 'Run', prompt: 'Start outreach campaign for these leads' },
      ],
      []
    );
  }, 2200);
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
  setTimeout(() => {
    addAgentMessage(jobId, "I'll create an outreach campaign for these leads with personalized, signal-driven messaging.", {
      cardType: 'JOB_PROPOSAL',
      cardData: {
        jobName: 'Outreach campaign \u2014 Prioritized leads',
        jobType: 'DRAFT_OUTREACH',
        inputsSummary: ['25 leads from prioritization flow', 'Signal-driven personalization', 'Tone: concise, reason-for-now'],
        outputsExpected: ['Personalized drafts per lead', 'Signal-based hooks', 'Approval queue before sending'],
        approvalsNeeded: true,
      },
    });
    updateJobSuggestions(jobId,
      [{ id: 'ns_run_outreach', title: 'Run the outreach campaign', why: 'Draft personalized messages for 25 leads', cta: 'Run', prompt: 'Yes\u2014run it.' }],
      []
    );
  }, 800);
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
