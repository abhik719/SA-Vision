import { useThreadStore } from '../store/useThreadStore';
import { useAppStore } from '../store/useAppStore';
import { useJobStore } from '../store/useJobStore';

import type { Message } from '../types/thread';
import type { Job } from '../types/job';

/**
 * Deterministic scripted "agent" — pattern matches on seller input and dispatches
 * scripted response sequences with simulated delays.
 */
export function processSellerMessage(threadId: string, content: string) {
  const lower = content.toLowerCase().trim();

  // ═══════════════════════════════════════════════════
  // FLOW A: "What changed" → Steering → Job spawn → Results → Outreach
  // ═══════════════════════════════════════════════════
  if (lower.includes('what changed') || lower.includes('what\'s changed')) {
    flowWhatChanged(threadId);
    return;
  }
  if (lower.includes('deprioritize') || lower.includes('weight intent')) {
    flowSteering(threadId, content);
    return;
  }
  // "Yes—run it" or "Run job" in the weekly book review thread
  if (
    (lower === 'yes' || lower.includes('run it') || lower === 'run job' || lower === 'yes—run it.' || lower === 'yes\u2014run it.') &&
    threadId === 'th_weekly_book_review'
  ) {
    flowRunJobApproval(threadId);
    return;
  }
  // Draft outreach for remaining leads (Flow A continuation)
  if (
    threadId === 'th_weekly_book_review' &&
    lower.includes('draft') &&
    lower.includes('remaining')
  ) {
    flowDraftRemainingLeads(threadId);
    return;
  }

  // ═══════════════════════════════════════════════════
  // FLOW B: Signal-driven (th_intent_crm_modernization)
  // ═══════════════════════════════════════════════════
  if (
    threadId === 'th_intent_crm_modernization' &&
    ((lower.includes('revops') && lower.includes('finance')) || lower.includes('vp+'))
  ) {
    flowSignalLeads(threadId);
    return;
  }
  if (
    (lower === 'yes' || lower.includes('run it') || lower === 'run job' || lower === 'yes\u2014run it.') &&
    threadId === 'th_intent_crm_modernization'
  ) {
    flowSignalLeadsApproval(threadId);
    return;
  }
  // "Add to campaign" in Flow B
  if (
    threadId === 'th_intent_crm_modernization' &&
    lower.includes('add') &&
    lower.includes('campaign')
  ) {
    flowAddToCampaign(threadId);
    return;
  }

  // ═══════════════════════════════════════════════════
  // FLOW C: Edit with agent → approve all → recurring
  // ═══════════════════════════════════════════════════
  if (
    lower.includes('make') &&
    (lower.includes('direct') || lower.includes('shorter') || lower.includes('mention'))
  ) {
    flowEditDrafts(threadId);
    return;
  }
  if (lower.includes('approve all')) {
    flowApproveAll(threadId);
    return;
  }
  // "Create recurring job" or "Follow-up nudges" (Flow C final step)
  if (
    lower.includes('recurring') ||
    lower.includes('follow-up nudge') ||
    lower.includes('follow up nudge')
  ) {
    flowCreateRecurringJob(threadId);
    return;
  }

  // ═══════════════════════════════════════════════════
  // FLOW D: Thread → Evidence → multithread/opp fix
  // ═══════════════════════════════════════════════════
  if (
    lower.includes('which') &&
    lower.includes('opp') &&
    (lower.includes('thin') || lower.includes('finance') || lower.includes('coverage'))
  ) {
    flowOppCoverage(threadId);
    return;
  }
  if (
    (lower.includes('opp') && (lower.includes('thin') || lower.includes('coverage'))) ||
    (lower.includes('multithread') && !lower.includes('top'))
  ) {
    flowMultithreadPlan(threadId);
    return;
  }
  // "Fix" or "show me the blocked job" (Flow D)
  if (
    lower.includes('fix') && (lower.includes('input') || lower.includes('blocked'))
  ) {
    flowShowBlockedJob(threadId);
    return;
  }
  // "Find Finance and IT leads for the 4 opp-risk" (Flow D alternate path)
  if (
    lower.includes('find') && lower.includes('opp-risk')
  ) {
    flowFindOppRiskLeads(threadId);
    return;
  }

  // ═══════════════════════════════════════════════════
  // GENERIC FLOWS
  // ═══════════════════════════════════════════════════
  if (lower.includes('draft') || lower.includes('outreach') || lower.includes('reason-for-now')) {
    flowDraftOutreach(threadId);
    return;
  }
  if (lower.includes('hot') && lower.includes('account')) {
    flowHotAccounts(threadId);
    return;
  }
  if (lower.includes('quick') || lower.includes('best next') || lower.includes('12 min')) {
    flowQuickAdvice(threadId);
    return;
  }
  if (lower.includes('approval') || lower.includes('drafts waiting')) {
    flowShowApprovals(threadId);
    return;
  }
  if (lower.includes('cold start') || lower.includes('cold-start') || lower.includes('wedge')) {
    flowColdStart(threadId);
    return;
  }
  if (lower.includes('customize')) {
    flowCustomize(threadId, content);
    return;
  }
  if (lower.includes('tell me more about:')) {
    flowSignalDetail(threadId, content);
    return;
  }
  if (lower.startsWith('signal_pref_confirmed:')) {
    flowSignalPrefConfirmed(threadId, content);
    return;
  }

  flowGeneric(threadId, content);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function addAgentMessage(
  threadId: string,
  content: string,
  extras?: Partial<Message>
) {
  const { addMessage } = useThreadStore.getState();
  addMessage(threadId, {
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

function selectJob(jobId: string) {
  const { selectJob: appSelectJob } = useAppStore.getState();
  appSelectJob(jobId);
}

function updateThreadSuggestions(
  threadId: string,
  nextSuggestions?: Array<{ id: string; title: string; why: string; cta: string; prompt: string }>,
  askSuggestions?: Array<{ id: string; question: string; why: string }>
) {
  const { updateThread } = useThreadStore.getState();
  const updates: Record<string, unknown> = {};
  if (nextSuggestions !== undefined) updates.nextSuggestions = nextSuggestions;
  if (askSuggestions !== undefined) updates.askSuggestions = askSuggestions;
  updateThread(threadId, updates as Partial<import('../types/thread').Thread>);
}

/** Job configs for simulation */
const JOB_SIM_CONFIG: Record<
  string,
  { title: string; type: Job['type']; evidenceId: string; stages: string[]; scopeOutput: string }
> = {
  job_find_finance_top8: {
    title: 'Find Finance stakeholders for top 8 changed accounts',
    type: 'FIND_LEADS',
    evidenceId: 'ev_3102',
    stages: ['Scanning accounts', 'Matching personas', 'Ranking leads', 'Checking coverage', 'Complete'],
    scopeOutput: '8 accounts \u2192 14 leads found, 3 coverage gaps',
  },
  job_find_engaged_acme: {
    title: 'Find engaged RevOps + Finance stakeholders (Acme)',
    type: 'FIND_LEADS',
    evidenceId: 'ev_3103',
    stages: ['Scanning Acme', 'Matching VP+ RevOps/Finance', 'Filtering engaged', 'Ranking', 'Complete'],
    scopeOutput: 'Acme \u2192 16 leads found, 9 engaged in last 30d',
  },
};

function createAndRunJob(
  threadId: string,
  jobId: string,
  delayMs: number = 2500
) {
  const config = JOB_SIM_CONFIG[jobId];
  if (!config) return;

  const { createJob, setJobStatus, updateJobProgress, setJobEvidence } = useJobStore.getState();
  const { addSpawnedJob } = useThreadStore.getState();
  const now = new Date().toISOString();

  const job: Job = {
    id: jobId,
    originThreadId: threadId,
    type: config.type,
    title: config.title,
    status: 'QUEUED',
    createdAt: now,
    updatedAt: now,
    scopeOutput: config.scopeOutput,
    inputs: {
      accountIds: [],
      personas: ['CFO', 'VP Finance', 'RevOps'],
      seniority: ['VP', 'CXO'],
      constraints: [],
    },
    outputs: {
      summary: { leadsFound: 14, accountsCovered: 8, coverageGaps: 3 },
    },
    progressStages: config.stages,
    currentStage: 0,
  };

  createJob(job);
  addSpawnedJob(threadId, jobId);

  addAgentMessage(threadId, `Running **${config.title}** \u2014 ETA ~${Math.round(delayMs / 1000)}s.`);

  const stageCount = config.stages.length;
  const stageInterval = delayMs / (stageCount + 2);

  // QUEUED \u2192 RUNNING immediately
  setTimeout(() => {
    setJobStatus(jobId, 'RUNNING');
  }, 100);

  // Progress stages
  for (let i = 0; i < stageCount; i++) {
    setTimeout(() => {
      updateJobProgress(jobId, i);
    }, 200 + i * stageInterval);
  }

  // Complete after delay
  setTimeout(() => {
    setJobStatus(jobId, 'COMPLETED');
    updateJobProgress(jobId, stageCount - 1);
    setJobEvidence(jobId, config.evidenceId);
    setEvidence(config.evidenceId);
    selectJob(jobId);

    addAgentMessage(threadId, `Done. ${config.scopeOutput}`, {
      cardType: 'JOB_RESULT',
      cardData: {
        jobId,
        jobTitle: config.title,
        completedTime: new Date().toISOString(),
        highlights: [
          config.scopeOutput,
          'Leads ranked by match score',
          'Coverage gaps highlighted',
        ],
      },
    });
  }, delayMs);
}

// ═══════════════════════════════════════════════════════
// FLOW A: What changed \u2192 Steering \u2192 Job \u2192 Outreach
// ═══════════════════════════════════════════════════════

function flowWhatChanged(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      '8 accounts changed. Biggest: Acme (VP Sales hire + RevOps hiring spike), Nimbus (new VP RevOps), 2 opp-risk accounts thin on Finance.',
      {
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_2001', label: 'Open changes (8)' },
        ],
      }
    );
    setEvidence('ev_2001');

    // Update suggestions to guide the next step
    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_dyn_1', title: 'Deprioritize touched accounts and re-rank', why: 'Removes noise from recently-contacted accounts', cta: 'Run', prompt: 'Deprioritize anything touched in last 30 days; weight intent less.' },
        { id: 'ns_dyn_2', title: 'Find Finance stakeholders for changed accounts', why: '8 accounts changed \u2014 find the right people now', cta: 'Run', prompt: 'Find Finance stakeholders for the top 8 changed accounts' },
      ],
      [
        { id: 'as_dyn_1', question: 'Which of these 8 accounts have the strongest intent signals?', why: 'Focus on the highest-signal accounts first' },
        { id: 'as_dyn_2', question: 'Which accounts have an opp but thin Finance coverage?', why: 'Identifies multithreading gaps in active opportunities' },
      ]
    );
  }, 800);
}

function flowSteering(threadId: string, content: string) {
  const chips: string[] = [];
  const lower = content.toLowerCase();
  if (lower.includes('deprioritize')) chips.push('Deprioritize touched <30d');
  if (lower.includes('weight intent')) chips.push('Weight intent: medium');
  if (lower.includes('vp+') || lower.includes('vp ')) chips.push('Prefer VP+ for multithreading');
  if (chips.length === 0) chips.push('Custom re-rank applied');

  setTimeout(() => {
    const { updateDecisionChips } = useThreadStore.getState();
    updateDecisionChips(threadId, chips);

    addAgentMessage(
      threadId,
      'Done. Updated ranking. Want me to find Finance stakeholders for the top 8 changed accounts?',
      {
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_2002', label: 'Open ranking (10)' },
        ],
        cardType: 'DECISION_CHIPS',
        cardData: chips,
      }
    );
    setEvidence('ev_2002');

    // After steering, suggest the job proposal
    setTimeout(() => {
      addAgentMessage(
        threadId,
        "I'll prioritize CFO/VP Finance and flag coverage gaps across the 8 changed accounts.",
        {
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
        }
      );

      // Update suggestions for next step
      updateThreadSuggestions(
        threadId,
        [
          { id: 'ns_dyn_3', title: 'Run the Finance stakeholder search', why: 'Job is configured and ready to go', cta: 'Run', prompt: 'Yes\u2014run it.' },
        ],
        [
          { id: 'as_dyn_3', question: 'Can you also include RevOps and IT personas?', why: 'Broadens the search to cover more buying committee roles' },
        ]
      );
    }, 500);
  }, 1000);
}

function flowRunJobApproval(threadId: string) {
  setTimeout(() => {
    addAgentMessage(threadId, "Started job. I'll drop results here when ready.");
    createAndRunJob(threadId, 'job_find_finance_top8', 3000);

    // After job completes, update suggestions
    setTimeout(() => {
      updateThreadSuggestions(
        threadId,
        [
          { id: 'ns_dyn_4', title: 'Draft reason-for-now outreach for top leads', why: '14 leads found \u2014 create personalized messages with signal hooks', cta: 'Run', prompt: 'Draft reason-for-now outreach for the top 8 leads' },
          { id: 'ns_dyn_5', title: 'Draft outreach for remaining 8 leads', why: '14 leads found but only 6 initially selected', cta: 'Run', prompt: 'Draft reason-for-now outreach for the remaining 8 leads' },
        ],
        [
          { id: 'as_dyn_4', question: 'Which leads have the warmest path?', why: 'Warm intros get 3x response rate' },
          { id: 'as_dyn_5', question: 'Which accounts have an opp but thin Finance coverage?', why: 'Identifies multithreading gaps in active opportunities' },
        ]
      );
    }, 3200);
  }, 600);
}

function flowDraftRemainingLeads(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      "I'll draft reason-for-now messages for the remaining 8 leads with signal-based hooks. Each will need your approval.",
      {
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Draft outreach for remaining 8 leads',
          jobType: 'DRAFT_OUTREACH',
          inputsSummary: ['8 remaining leads from stakeholder search', 'Signal-driven personalization', 'Tone: concise'],
          outputsExpected: ['8 draft messages', 'Signal-based hooks', 'Approval queue'],
          approvalsNeeded: true,
        },
      }
    );
  }, 800);
}

function flowDraftOutreach(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      "I'll draft personalized outreach messages based on signal-driven hooks. Each message will need your approval before sending.",
      {
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Draft outreach for selected leads',
          jobType: 'DRAFT_OUTREACH',
          inputsSummary: [
            'Leads from most recent search results',
            'Signal-driven personalization',
            'Tone: concise',
          ],
          outputsExpected: [
            'Personalized draft messages',
            'Signal-based hooks',
            'Approval queue',
          ],
          approvalsNeeded: true,
        },
      }
    );

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_draft_1', title: 'Run the draft outreach job', why: 'Job configured \u2014 will create drafts for approval', cta: 'Run', prompt: 'Yes\u2014run it.' },
      ],
      [
        { id: 'as_draft_1', question: 'Can you make the tone warmer?', why: 'Adjusts messaging style across all drafts' },
      ]
    );
  }, 800);
}

// ═══════════════════════════════════════════════════════
// FLOW B: Signal-driven lead find \u2192 campaign
// ═══════════════════════════════════════════════════════

function flowSignalLeads(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      "Got it. I'll find 12\u201320 leads across Acme with (VP+), (RevOps/Finance), (recent engagement). Run?",
      {
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Find engaged stakeholders (Acme)',
          jobType: 'FIND_LEADS',
          inputsSummary: [
            'Account: Acme Software',
            'Personas: RevOps, Finance',
            'Seniority: VP+',
            'Engaged in last 30d',
          ],
          outputsExpected: [
            'Lead list with match scores',
            'Engagement signals',
            'Coverage report',
          ],
          approvalsNeeded: false,
        },
      }
    );

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_sig_1', title: 'Run the lead-find job for Acme', why: 'Search configured for RevOps + Finance VP+ with recent engagement', cta: 'Run', prompt: 'Yes\u2014run it.' },
      ],
      [
        { id: 'as_sig_1', question: 'What other topics is Acme surging on besides CRM?', why: 'May reveal additional angles for outreach' },
        { id: 'as_sig_2', question: 'Include IT personas too?', why: 'Broadens the buying committee coverage' },
      ]
    );
  }, 800);
}

function flowSignalLeadsApproval(threadId: string) {
  setTimeout(() => {
    addAgentMessage(threadId, "Started job. I'll drop results here when ready.");
    createAndRunJob(threadId, 'job_find_engaged_acme', 3000);

    // After job completes, update suggestions for campaign action
    setTimeout(() => {
      updateThreadSuggestions(
        threadId,
        [
          { id: 'ns_sig_2', title: 'Add top 10 leads to "Acme CRM Modernization" campaign', why: 'Route leads to campaign + queue 6 reason-for-now drafts', cta: 'Run', prompt: 'Add the top 10 leads to the Acme CRM Modernization campaign and queue 6 reason-for-now drafts for approval.' },
          { id: 'ns_sig_3', title: 'Draft outreach for the 3 most engaged leads', why: 'Highest engagement = highest response rate', cta: 'Run', prompt: 'Draft reason-for-now outreach for the top 3 most engaged leads' },
        ],
        [
          { id: 'as_sig_3', question: 'Who has the warmest path to these leads?', why: 'Mutual connections increase response rate 3x' },
          { id: 'as_sig_4', question: 'What signals are driving the engagement spike?', why: 'Helps tailor outreach messaging' },
        ]
      );
    }, 3200);
  }, 600);
}

function flowAddToCampaign(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      'Added 10 leads to campaign **"Acme CRM Modernization"** and queued 6 reason-for-now drafts for approval.',
      {
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_4202', label: 'Open approval queue (6)' },
        ],
        cardType: 'JOB_RESULT',
        cardData: {
          jobId: 'job_campaign_acme',
          jobTitle: 'Acme CRM Modernization campaign setup',
          completedTime: new Date().toISOString(),
          highlights: [
            '10 leads added to campaign',
            '6 reason-for-now drafts queued for approval',
            'Signal-driven personalization applied',
          ],
        },
      }
    );
    setEvidence('ev_4202');

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_camp_1', title: 'Review and approve 6 pending drafts', why: 'Drafts are queued and ready for your review', cta: 'Open', prompt: 'Show me the draft approval queue' },
      ],
      [
        { id: 'as_camp_1', question: 'Which drafts have the strongest signal hooks?', why: 'Helps you prioritize which messages to send first' },
      ]
    );
  }, 800);
}

// ═══════════════════════════════════════════════════════
// FLOW C: Edit with agent \u2192 approve all \u2192 recurring
// ═══════════════════════════════════════════════════════

function flowEditDrafts(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      'Updated all 8 drafts with your guidance. They\u2019re now more direct, mention the VP Sales hire and RevOps hiring spike, and are under 60 words. Want to approve all, or review first?',
      {
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_4201', label: 'Review updated drafts (8)' },
        ],
      }
    );
    setEvidence('ev_4201');

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_edit_1', title: 'Approve all 8 updated drafts', why: 'All drafts updated with your edits \u2014 ready to send', cta: 'Run', prompt: 'Approve all' },
        { id: 'ns_edit_2', title: 'Review each draft individually', why: 'Check the edits before approving', cta: 'Open', prompt: 'Show me the draft approval queue' },
      ],
      [
        { id: 'as_edit_1', question: 'Can you make these warmer without losing the signal angle?', why: 'Adjusts tone while keeping personalization' },
        { id: 'as_edit_2', question: 'Which drafts have the strongest opening line?', why: 'Focus review on highest-impact messages' },
      ]
    );
  }, 800);
}

function flowApproveAll(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      'All drafts approved and ready to send. Want me to queue follow-ups if no response in 4 business days (LinkedIn-only)?',
      {
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Follow-up nudges (LinkedIn)',
          jobType: 'DRAFT_OUTREACH',
          inputsSummary: [
            'Trigger: no response in 4 business days',
            'Channel: LinkedIn only',
            'Tone: brief nudge with new angle',
            'Recurrence: check weekly',
          ],
          outputsExpected: ['Auto-generated follow-up drafts', 'Approval queue before sending'],
          approvalsNeeded: true,
        },
      }
    );

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_approve_1', title: 'Create recurring follow-up job', why: 'Auto-nudges for non-responders after 4 business days', cta: 'Run', prompt: 'Create the recurring follow-up nudges job (LinkedIn only, weekly check)' },
      ],
      [
        { id: 'as_approve_1', question: 'What should the follow-up angle be?', why: 'Helps craft a different approach for the nudge' },
        { id: 'as_approve_2', question: 'Can you also track who opened the initial message?', why: 'Engagement data helps prioritize follow-ups' },
      ]
    );
  }, 800);
}

function flowCreateRecurringJob(threadId: string) {
  setTimeout(() => {
    // Create a recurring job in the job store
    const { createJob } = useJobStore.getState();
    const { addSpawnedJob } = useThreadStore.getState();
    const now = new Date().toISOString();

    const jobId = `job_recurring_followup_${Date.now()}`;
    const job: Job = {
      id: jobId,
      originThreadId: threadId,
      type: 'DRAFT_OUTREACH',
      title: 'Follow-up nudges (LinkedIn)',
      status: 'QUEUED',
      createdAt: now,
      updatedAt: now,
      scopeOutput: 'Weekly check \u2192 auto-generate follow-ups for non-responders',
      inputs: {
        constraints: ['Trigger: no response in 4 business days', 'Channel: LinkedIn only', 'Tone: brief nudge'],
      },
      outputs: { summary: {} },
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        timeOfDay: '09:00',
      },
      progressStages: ['Checking responses', 'Generating follow-ups', 'Queue for approval'],
      currentStage: 0,
    };

    createJob(job);
    addSpawnedJob(threadId, jobId);

    addAgentMessage(
      threadId,
      'Recurring job created: **Follow-up nudges (LinkedIn)**. I\u2019ll check every Monday for non-responders and queue follow-up drafts for your approval.',
      {
        cardType: 'JOB_RESULT',
        cardData: {
          jobId,
          jobTitle: 'Follow-up nudges (LinkedIn)',
          completedTime: now,
          highlights: [
            'Recurring: every Monday at 9:00 AM',
            'Checks for non-responders after 4 business days',
            'Drafts queued for approval before sending',
          ],
        },
      }
    );

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_recur_1', title: 'View the recurring job configuration', why: 'See schedule, triggers, and settings', cta: 'Open', prompt: 'Show me the follow-up nudges job configuration' },
      ],
      [
        { id: 'as_recur_1', question: 'Can I adjust the follow-up timing to 3 days instead?', why: 'Shorter windows for time-sensitive prospects' },
      ]
    );
  }, 800);
}

// ═══════════════════════════════════════════════════════
// FLOW D: Multithread / opp needs attention
// ═══════════════════════════════════════════════════════

function flowOppCoverage(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      '4 opp accounts are thin on Finance + IT. Want me to generate a multithread plan?',
      {
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_needs_attention_01', label: 'View coverage gaps (4)' },
        ],
      }
    );
    setEvidence('ev_needs_attention_01');

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_opp_1', title: 'Generate multithread plan for opp-risk accounts', why: '4 accounts missing Finance + IT stakeholders', cta: 'Run', prompt: 'Generate a multithread plan for the 4 opp-risk accounts' },
        { id: 'ns_opp_2', title: 'Find missing personas directly', why: 'Skip the plan \u2014 go straight to lead search', cta: 'Run', prompt: 'Find Finance and IT leads for the 4 opp-risk accounts instead' },
      ],
      [
        { id: 'as_opp_1', question: 'What personas are missing at each account?', why: 'Shows specific gaps per account' },
        { id: 'as_opp_2', question: 'Which account has the most urgent gap?', why: 'Prioritizes by deal stage and signal strength' },
      ]
    );
  }, 800);
}

function flowMultithreadPlan(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      "I'll create a multithread plan for those 4 opp-risk accounts. I need 2 inputs to proceed:",
      {
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_needs_attention_01', label: 'View needs attention' },
        ],
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Multithread plan (opp risk accounts)',
          jobType: 'MULTITHREAD_PLAN',
          inputsSummary: [
            '4 opp-risk accounts',
            'Needs: CRM opp stage preference (Stage 2+)',
            'Needs: Persona preferences (Finance + IT + Exec sponsor)',
          ],
          outputsExpected: ['Stakeholder map per account', 'Recommended next actions', 'Coverage report'],
          approvalsNeeded: false,
        },
      }
    );
    setEvidence('ev_needs_attention_01');

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_mt_1', title: 'Fix missing inputs and rerun', why: 'Select opp stages and personas to unblock the job', cta: 'Open', prompt: 'Show me the blocked job so I can fix the inputs' },
        { id: 'ns_mt_2', title: 'Skip plan \u2014 find leads directly', why: 'Search for Finance + IT leads at the 4 opp accounts', cta: 'Run', prompt: 'Find Finance and IT leads for the 4 opp-risk accounts instead' },
      ],
      [
        { id: 'as_mt_1', question: 'What opp stages should I include?', why: 'Helps configure the right scope for the plan' },
      ]
    );
  }, 800);
}

function flowShowBlockedJob(threadId: string) {
  setTimeout(() => {
    // Navigate to the blocked job
    const { selectJob: appSelectJob, setActiveTab } = useAppStore.getState();
    setActiveTab('JOBS');
    appSelectJob('job_multithread_plan_opp_risk');
    setEvidence('ev_needs_attention_01');

    addAgentMessage(
      threadId,
      'Opening the blocked job. You\u2019ll see 2 quick selections needed:\n\n1. **Opp stages**: Select which stages to include (recommended: Stage 2+)\n2. **Personas**: Choose which roles are missing (recommended: Finance + IT + Exec sponsor)\n\nOnce you pick, I\u2019ll rerun the job.',
    );

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_fix_1', title: 'Set Stage 2+ and Finance + IT + Exec sponsor, then rerun', why: 'Recommended defaults based on your book', cta: 'Run', prompt: 'Use Stage 2+ and Finance + IT + Exec sponsor, then rerun the multithread plan' },
      ],
      []
    );
  }, 600);
}

function flowFindOppRiskLeads(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      "I'll search for Finance and IT leads at the 4 opp-risk accounts directly. Here\u2019s the proposed job:",
      {
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Find Finance + IT leads (4 opp-risk accounts)',
          jobType: 'FIND_LEADS',
          inputsSummary: ['4 opp-risk accounts', 'Personas: Finance, IT, Exec sponsor', 'Seniority: VP+'],
          outputsExpected: ['Lead list per account', 'Warm path indicators', 'Coverage report'],
          approvalsNeeded: false,
        },
      }
    );

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_opp_find_1', title: 'Run the lead search', why: 'Job configured and ready to go', cta: 'Run', prompt: 'Yes\u2014run it.' },
      ],
      []
    );
  }, 800);
}

// ═══════════════════════════════════════════════════════
// GENERIC FLOWS
// ═══════════════════════════════════════════════════════

function flowHotAccounts(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      'Here are the 5 accounts with the strongest signals right now. Three signal types are driving the spikes: exec movement, intent surges, and hiring activity.',
      {
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_2002', label: 'View ranked accounts (5)' },
        ],
      }
    );
    setEvidence('ev_2002');

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_hot_1', title: 'Find Finance stakeholders for these 5 accounts', why: 'Accounts are hot \u2014 find the right people to reach', cta: 'Run', prompt: 'Find Finance stakeholders for the top 5 hot accounts' },
        { id: 'ns_hot_2', title: 'Draft outreach for the top 3', why: 'Highest signal accounts = best timing', cta: 'Run', prompt: 'Draft reason-for-now outreach for the top 3 hot accounts' },
      ],
      [
        { id: 'as_hot_1', question: 'What changed at Acme specifically?', why: 'Acme has the most activity right now' },
      ]
    );
  }, 800);
}

function flowQuickAdvice(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      'Based on your current signals, here are your 3 best next actions:\n\n1. **Multi-thread Acme Software** \u2014 New VP Sales hire + RevOps expansion creates an opening.\n2. **Follow up with Northwind** \u2014 Champion engagement is up 40%.\n3. **Review Fabrikam AI** \u2014 Series B just announced; they\u2019re hiring VP Sales.\n\nWant me to find leads for any of these accounts?'
    );

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_quick_1', title: 'Find leads for Acme Software', why: 'Strongest signals + hiring activity', cta: 'Run', prompt: 'Find Finance and RevOps leads for Acme Software' },
        { id: 'ns_quick_2', title: 'Draft follow-up for Northwind', why: 'Champion engagement up 40% \u2014 strike while hot', cta: 'Run', prompt: 'Draft a follow-up message for the Northwind champion' },
      ],
      [
        { id: 'as_quick_1', question: 'Tell me more about the Fabrikam Series B', why: 'Funding events create budget windows' },
      ]
    );
  }, 600);
}

function flowShowApprovals(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      'You have 8 draft messages waiting for your approval. Opening the approval queue now.',
      {
        attachments: [
          { type: 'EVIDENCE_LINK', evidenceId: 'ev_4201', label: 'Open approval queue (8)' },
        ],
      }
    );
    setEvidence('ev_4201');

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_approvals_1', title: 'Approve all 8 drafts', why: 'Quick batch approval if you\u2019re confident', cta: 'Run', prompt: 'Approve all' },
      ],
      [
        { id: 'as_approvals_1', question: 'Which drafts have the strongest signal hooks?', why: 'Helps prioritize your review' },
      ]
    );
  }, 600);
}

function flowColdStart(threadId: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      "I can generate a list of 10 accounts with the best wedge opportunities for your territory. Here's the proposed job:",
      {
        cardType: 'JOB_PROPOSAL',
        cardData: {
          jobName: 'Cold start: Find 10 accounts with a wedge',
          jobType: 'PRIORITIZE_ACCOUNTS',
          inputsSummary: [
            'Territory: West SMB',
            'Criteria: intent signals + hiring + recent funding',
            'Target: 10 best accounts',
          ],
          outputsExpected: [
            'Ranked account list with wedge reasons',
            'Signal-based prioritization',
          ],
          approvalsNeeded: false,
        },
      }
    );

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_cold_1', title: 'Run the cold start job', why: 'Job configured \u2014 will rank 10 accounts with wedge reasons', cta: 'Run', prompt: 'Yes\u2014run it.' },
      ],
      [
        { id: 'as_cold_1', question: 'Can I focus on FinTech accounts specifically?', why: 'Narrows the scope to a specific segment' },
      ]
    );
  }, 800);
}

function flowCustomize(threadId: string, _content: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      "Sure! Let's customize this job. What would you like to change? You can adjust:\n\n- **Scope** (territory, segment, time window)\n- **Personas** (roles to target)\n- **Constraints** (already-saved, activity recency)\n- **Output format** (table, summary, drafts)\n\nJust tell me what to tweak."
    );
  }, 600);
}

function flowSignalDetail(threadId: string, content: string) {
  const signal = content.replace(/^tell me more about:\s*/i, '').trim();
  setTimeout(() => {
    addAgentMessage(
      threadId,
      `Here's what I know about **${signal}**.\n\nI've pulled together the relevant signals, suggested targets, and evidence in the detail view to the right. You can take action directly from there \u2014 find leads, draft outreach, or kick off a job.\n\nLet me know if you'd like to dig deeper or take a different approach.`
    );
  }, 600);
}

function flowSignalPrefConfirmed(threadId: string, _content: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      "Preferences updated. I'll factor this into future recommendations and job configurations."
    );
  }, 600);
}

function flowGeneric(threadId: string, _content: string) {
  setTimeout(() => {
    addAgentMessage(
      threadId,
      "I understand. Let me look into that. Based on what I see in your book, I'd recommend starting with a prioritization review. Would you like me to show what changed recently, or would you prefer to jump straight to lead finding?"
    );

    updateThreadSuggestions(
      threadId,
      [
        { id: 'ns_gen_1', title: 'Show what changed since last week', why: 'See recent exec moves, intent spikes, and hiring trends', cta: 'Open', prompt: 'What changed in my book since last week?' },
        { id: 'ns_gen_2', title: 'Find leads for top accounts', why: 'Skip review \u2014 go straight to lead finding', cta: 'Run', prompt: 'Find Finance and RevOps leads for my top 5 accounts' },
      ],
      [
        { id: 'as_gen_1', question: 'What are my top 3 priority accounts right now?', why: 'Quick signal-based prioritization' },
      ]
    );
  }, 600);
}
