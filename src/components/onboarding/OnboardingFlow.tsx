import { useState, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Zap, Send, Paperclip, ArrowLeft, Check } from 'lucide-react';
import inlogoPng from '../../assets/Inlogo.png';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import { flowQuickPlayStartExport } from '../../flows/engine';
import type { Job } from '../../types/job';

// ─── Objectives for preferences flow ────────────────────────

const OBJECTIVE_OPTIONS = [
  { id: 'pipeline', label: 'Generate pipeline' },
  { id: 'expand_accounts', label: 'Expand key accounts' },
  { id: 'warm_intros', label: 'Find warm intros' },
];

const QUICK_TERRITORIES = [
  'West Coast SMB',
  'Enterprise \u2014 Northeast',
  'Mid-Market SaaS',
];

// ─── Starter Play Intents ────────────────────────────────────

interface StarterPlayIntent {
  intentKey: string;
  label: string;
  helper: string;
  chips: string[];
  playTitle: string;
  territory: string;
}

const STARTER_PLAY_INTENTS: StarterPlayIntent[] = [
  {
    intentKey: 'ai_growth_bay',
    label: 'Bay Area AI Sales leaders',
    helper: 'Fast-growing AI companies \u2022 Sales leadership',
    chips: ['Uses growth signals', '~20 leads'],
    playTitle: 'AI growth \u2014 Bay Area',
    territory: 'Bay Area',
  },
  {
    intentKey: 'midsize_software_na',
    label: 'Mid-size software decision makers',
    helper: '200\u20131,000 employees \u2022 North America',
    chips: ['ICP match', '~20 leads'],
    playTitle: 'Mid-size software \u2014 NA',
    territory: 'North America',
  },
  {
    intentKey: 'growing_sales_teams',
    label: 'Who\u2019s hiring GTM right now?',
    helper: 'Software companies expanding Sales teams',
    chips: ['Hiring signals', 'High intent'],
    playTitle: 'Software companies with growing Sales teams',
    territory: 'All territories',
  },
  {
    intentKey: 'recent_funding',
    label: 'Newly funded (Series A\u2013C)',
    helper: 'Founders + GTM heads at recently funded companies',
    chips: ['Funding signals', 'Warm timing'],
    playTitle: 'Recent funding (A\u2013C)',
    territory: 'All territories',
  },
];

// ─── Confetti celebration ─────────────────────────────────────

function fireConfettiCelebration() {
  const colors = ['#0A66C2', '#70B5F9', '#DCE6F1', '#FFFFFF', '#E7A33E'];

  // Left cannon
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 60,
    startVelocity: 55,
    gravity: 0.85,
    ticks: 300,
    origin: { x: 0, y: 0.65 },
    colors,
    scalar: 1.1,
    shapes: ['square', 'circle'],
  });

  // Right cannon
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 60,
    startVelocity: 55,
    gravity: 0.85,
    ticks: 300,
    origin: { x: 1, y: 0.65 },
    colors,
    scalar: 1.1,
    shapes: ['square', 'circle'],
  });

  // Center rain from top (delayed slightly)
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 270,
      spread: 120,
      startVelocity: 30,
      gravity: 0.7,
      ticks: 280,
      origin: { x: 0.5, y: 0 },
      colors,
      scalar: 0.9,
      shapes: ['square', 'circle'],
    });
  }, 120);
}

// ─── Mission Card ────────────────────────────────────────────

function MissionCard({
  intent,
  starting,
  hovered,
  disabled,
  reduceMotion,
  onClick,
  onHover,
}: {
  intent: StarterPlayIntent;
  starting: boolean;
  hovered: boolean;
  disabled: boolean;
  reduceMotion: boolean;
  onClick: () => void;
  onHover: (v: boolean) => void;
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      onClick={onClick}
      whileHover={
        reduceMotion
          ? {}
          : { y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }
      }
      whileTap={reduceMotion ? {} : { scale: 0.985 }}
      initial={false}
      animate={{
        borderColor: hovered ? 'rgba(10,102,194,0.35)' : 'rgba(0,0,0,0.08)',
        opacity: disabled && !starting ? 0.4 : 1,
      }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="group relative w-full overflow-hidden rounded-[14px] border bg-white text-left outline-none"
      style={{
        padding: 14,
        cursor: starting || disabled ? 'default' : 'pointer',
        borderColor: 'rgba(0,0,0,0.08)',
      }}
    >
      {/* Animated gradient wave */}
      <div
        aria-hidden
        className="mission-shimmer absolute inset-0"
        style={{
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 180ms ease',
        }}
      />

      {/* Card content */}
      <div className="relative flex flex-col gap-[8px]">
        <div className="flex items-center gap-[10px]">
          {/* Text */}
          <div className="flex flex-1 flex-col">
            <span className="font-body text-[15px] font-semibold text-li-text-primary leading-snug">
              {intent.label}
            </span>
            <span className="font-body text-[13px] text-li-text-tertiary">
              {intent.helper}
            </span>
          </div>

          {/* Right CTA */}
          <div className="flex shrink-0 items-center gap-[6px] self-center font-body text-[13px] font-semibold">
            {starting ? (
              <span className="flex items-center gap-[6px] text-li-text-tertiary">
                <span className="inline-block h-[14px] w-[14px] animate-spin rounded-full border-2 border-li-blue/25 border-t-li-blue" />
                Starting\u2026
              </span>
            ) : (
              <span className="flex items-center gap-[4px] rounded-full bg-li-blue px-[14px] py-[5px] text-[13px] font-bold tracking-wide text-white shadow-sm transition-all group-hover:shadow-md group-hover:shadow-li-blue/20">
                Run
              </span>
            )}
          </div>
        </div>

        {/* Chips */}
        {intent.chips.length > 0 && (
          <div className="flex gap-[6px]">
            {intent.chips.map((c) => (
              <span
                key={c}
                className="rounded-full font-body text-[11px] text-li-text-secondary"
                style={{
                  background: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: '3px 8px',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

// ─── Preferences Step 1: Territory ───────────────────────────

function PrefsTerritory({
  territory,
  setTerritory,
  onNext,
  onBack,
}: {
  territory: string;
  setTerritory: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedList, setSelectedList] = useState<string | null>(null);

  // Continue is enabled when either a list is selected or text is typed
  const canContinue = !!selectedList || !!territory.trim();

  // When continuing, use the selected list as territory if no custom text
  const handleContinue = () => {
    if (selectedList && !territory.trim()) {
      setTerritory(selectedList);
    }
    onNext();
  };

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Step indicator + progress */}
      <div className="flex flex-col gap-[10px]">
        <p className="font-body text-[12px] font-semibold uppercase tracking-wider text-li-text-tertiary">
          Step 1 of 2
        </p>
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#e0e0e0]">
          <div className="h-full rounded-full bg-li-blue transition-all duration-300" style={{ width: '50%' }} />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-[6px]">
        <h2 className="font-display text-[20px] font-semibold text-li-text-primary">
          Accounts in Focus
        </h2>
        <p className="font-body text-[13px] leading-[1.5] text-li-text-tertiary">
          Start with a list (synced from CRM or saved in Sales Nav) — or describe your territory: region, industry, company size, or simply paste or upload accounts.
        </p>
      </div>

      {/* Quick-pick chips */}
      <div className="flex flex-col gap-[10px]">
        <span className="font-body text-[12px] font-semibold uppercase tracking-wider text-li-text-tertiary">Your lists</span>
        <div className="flex flex-wrap gap-[6px]">
        {QUICK_TERRITORIES.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedList(selectedList === t ? null : t)}
            className={`rounded-full border px-[12px] py-[5px] font-body text-[12px] transition-colors ${
              selectedList === t
                ? 'border-li-blue bg-[#f0f7ff] text-li-blue'
                : 'border-li-border-standard text-li-text-secondary hover:border-li-blue hover:text-li-blue'
            }`}
          >
            {t}
          </button>
        ))}
        </div>
      </div>

      {/* Text input with send + upload */}
      <div className="flex flex-col gap-[10px]">
        <span className="font-body text-[12px] font-semibold uppercase tracking-wider text-li-text-tertiary">Describe your territory</span>
      <div className="relative flex items-center gap-[8px]">
        <input
          ref={inputRef}
          type="text"
          value={territory}
          onChange={(e) => setTerritory(e.target.value)}
          placeholder="e.g. West Coast SMB, SaaS companies 50-200 employees"
          className="flex-1 rounded-[10px] border border-li-border-standard bg-white py-[10px] pl-[14px] pr-[72px] font-body text-[14px] text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
        />
        <div className="absolute right-[8px] flex items-center gap-[4px]">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-[6px] p-[5px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
            title="Upload a file"
          >
            <Paperclip size={15} />
          </button>
          <button
            type="button"
            onClick={() => territory.trim() && handleContinue()}
            disabled={!territory.trim()}
            className={`rounded-[6px] p-[5px] transition-colors ${territory.trim() ? 'text-li-blue hover:bg-[#f0f7ff]' : 'text-li-text-tertiary'}`}
            title="Continue"
          >
            <Send size={15} />
          </button>
        </div>
        <input ref={fileRef} type="file" className="hidden" accept=".csv,.xlsx,.xls,.txt" />
      </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-[12px] pt-[8px]">
        <button
          onClick={onBack}
          className="flex items-center gap-[4px] rounded-[8px] px-[14px] py-[10px] font-body text-[13px] font-medium text-li-text-tertiary transition-colors hover:bg-[#f5f5f5]"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex-1 rounded-[8px] bg-li-blue py-[12px] font-body text-[14px] font-semibold text-white transition-colors hover:bg-li-blue-dark disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Preferences Step 2: Objectives ──────────────────────────

function PrefsObjective({
  selectedObjectives,
  toggleObjective,
  customObjective,
  setCustomObjective,
  roleNotes,
  setRoleNotes,
  workPrefs,
  setWorkPrefs,
  onBack,
  onFinish,
}: {
  selectedObjectives: string[];
  toggleObjective: (id: string) => void;
  customObjective: string;
  setCustomObjective: (v: string) => void;
  roleNotes: string;
  setRoleNotes: (v: string) => void;
  workPrefs: string;
  setWorkPrefs: (v: string) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const canContinue = selectedObjectives.length > 0 || customObjective.trim().length > 0;

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Step indicator */}
      <p className="font-body text-[12px] font-semibold uppercase tracking-wider text-li-text-tertiary">
        Step 2 of 2
      </p>

      {/* Progress bar */}
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#e0e0e0]">
        <div className="h-full rounded-full bg-li-blue transition-all duration-300" style={{ width: '100%' }} />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-[4px]">
        <h2 className="font-display text-[20px] font-semibold text-li-text-primary">
          Personalize your agentic experience
        </h2>
        <p className="font-body text-[13px] text-li-text-tertiary">
          This helps your agent prioritize the right signals and leads.
        </p>
      </div>

      {/* Objectives */}
      <div className="flex flex-col gap-[8px]">
        <label className="font-body text-[13px] font-semibold uppercase tracking-wider text-li-text-primary">
          Objectives
        </label>
        <div className="flex flex-wrap gap-[6px]">
          {OBJECTIVE_OPTIONS.map((o) => {
            const active = selectedObjectives.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => toggleObjective(o.id)}
                className={`flex items-center gap-[4px] rounded-full border px-[12px] py-[5px] font-body text-[12px] transition-colors ${
                  active
                    ? 'border-li-blue bg-[#f0f7ff] text-li-blue'
                    : 'border-li-border-standard text-li-text-secondary hover:border-li-blue hover:text-li-blue'
                }`}
              >
                {active && <Check size={12} />}
                {o.label}
              </button>
            );
          })}
        </div>
        {/* Free text for custom objectives */}
        <input
          type="text"
          value={customObjective}
          onChange={(e) => setCustomObjective(e.target.value)}
          placeholder="Or describe your objective in your own words..."
          className="rounded-[10px] border border-li-border-standard bg-white px-[14px] py-[9px] font-body text-[13px] text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
        />
      </div>

      {/* About your role */}
      <div className="flex flex-col gap-[4px]">
        <label className="font-body text-[13px] font-semibold uppercase tracking-wider text-li-text-primary">
          About your role
          <span className="ml-[6px] text-[11px] font-normal normal-case text-li-text-tertiary">optional</span>
        </label>
        <textarea
          value={roleNotes}
          onChange={(e) => setRoleNotes(e.target.value)}
          placeholder="e.g. I manage West Coast mid-market accounts, quota $2M/year, team of 3 SDRs..."
          rows={2}
          className="resize-none rounded-[10px] border border-li-border-standard bg-white px-[14px] py-[9px] font-body text-[13px] text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
        />
      </div>

      {/* Work preferences */}
      <div className="flex flex-col gap-[4px]">
        <label className="font-body text-[13px] font-semibold uppercase tracking-wider text-li-text-primary">
          Work preferences
          <span className="ml-[6px] text-[11px] font-normal normal-case text-li-text-tertiary">optional</span>
        </label>
        <textarea
          value={workPrefs}
          onChange={(e) => setWorkPrefs(e.target.value)}
          placeholder="e.g. I prospect 2-3 times a week, prefer LinkedIn InMail over email, keep messages short..."
          rows={2}
          className="resize-none rounded-[10px] border border-li-border-standard bg-white px-[14px] py-[9px] font-body text-[13px] text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-[12px] pt-[4px]">
        <button
          onClick={onBack}
          className="flex items-center gap-[4px] rounded-[8px] px-[14px] py-[10px] font-body text-[13px] font-medium text-li-text-tertiary transition-colors hover:bg-[#f5f5f5]"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          onClick={onFinish}
          disabled={!canContinue}
          className="flex-1 rounded-[8px] bg-li-blue py-[12px] font-body text-[14px] font-semibold text-white transition-colors hover:bg-li-blue-dark disabled:opacity-40"
        >
          Create my first Play
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

type OnboardingMode = 'starter' | 'prefs_territory' | 'prefs_objective';

export function OnboardingFlow() {
  const [mode, setMode] = useState<OnboardingMode>('starter');
  const [startingIntent, setStartingIntent] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Preferences state
  const [territory, setTerritory] = useState('');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [customObjective, setCustomObjective] = useState('');
  const [roleNotes, setRoleNotes] = useState('');
  const [workPrefs, setWorkPrefs] = useState('');
  const [prefsStarting, setPrefsStarting] = useState(false);

  const selectJob = useAppStore((s) => s.selectJob);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const createJobDirect = useJobStore((s) => s.createJobDirect);

  const toggleObjective = useCallback((id: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  }, []);

  const handleCardClick = useCallback((intent: StarterPlayIntent) => {
    if (startingIntent) return;

    // Confetti celebration (respects reduced motion)
    if (!reduceMotion) fireConfettiCelebration();

    setStartingIntent(intent.intentKey);

    // Persist onboarding state
    localStorage.setItem('sa.onboarding_completed', 'true');
    localStorage.setItem('sa.selected_territory', intent.territory);
    localStorage.setItem('sa.selected_objective', intent.intentKey);

    // Card-specific evidence IDs
    const CARD_EVIDENCE: Record<string, { reasoningEvId: string; accountsEvId: string }> = {
      ai_growth_bay: { reasoningEvId: 'ev_quick_ai_growth_reasoning', accountsEvId: 'ev_quick_ai_growth_accounts' },
      midsize_software_na: { reasoningEvId: 'ev_quick_midsize_sw_reasoning', accountsEvId: 'ev_quick_midsize_sw_accounts' },
      growing_sales_teams: { reasoningEvId: 'ev_quick_hiring_gtm_reasoning', accountsEvId: 'ev_quick_hiring_gtm_accounts' },
      recent_funding: { reasoningEvId: 'ev_quick_funded_reasoning', accountsEvId: 'ev_quick_funded_accounts' },
    };

    const cardEv = CARD_EVIDENCE[intent.intentKey] || {
      reasoningEvId: 'ev_prioritize_reasoning',
      accountsEvId: 'ev_prioritize_accounts',
    };

    // Create the play with intentKey stored in scope
    const now = new Date().toISOString();
    const starterPlay: Job = {
      id: 'play_001',
      kind: 'tracked',
      type: 'PRIORITIZE_ACCOUNTS',
      title: intent.playTitle,
      status: 'RUNNING',
      has_unread_results: false,
      createdAt: now,
      updatedAt: now,
      last_viewed_at: null,
      expires_at: null,
      archived_at: null,
      schedule: null,
      linked_context: null,
      evidenceId: cardEv.reasoningEvId,
      messages: [
        {
          id: 'msg_play_start',
          role: 'agent',
          timestamp: now,
          content: `Starting **${intent.playTitle}** — scanning your territory for the best targets...`,
        },
      ],
      scope: { territory: intent.territory, intentKey: intent.intentKey },
      spawnedJobIds: [],
      progressStages: [
        'Analyzing CRM data',
        'Scoring intent signals',
        'Ranking accounts by priority',
        'Finalizing top accounts',
      ],
      currentStage: 0,
    };

    localStorage.setItem('sa.active_play_id', 'play_001');
    createJobDirect(starterPlay);

    // Navigate into the play workspace after a brief beat (let confetti land)
    setTimeout(() => {
      selectJob('play_001');
      setCurrentEvidence(cardEv.reasoningEvId);
    }, 450);

    // After reasoning animation, trigger the discovery flow
    setTimeout(() => {
      const { updateJob } = useJobStore.getState();
      updateJob('play_001', {
        status: 'NEEDS_INPUT',
        has_unread_results: true,
        evidenceId: cardEv.accountsEvId,
      });

      // Trigger the quick play discovery start flow
      flowQuickPlayStartExport('play_001', intent.intentKey);
    }, 3500);
  }, [startingIntent, reduceMotion, selectJob, setCurrentEvidence, createJobDirect]);

  // Finish preferences flow — create a play from user-supplied preferences
  const handlePrefsFinish = useCallback(() => {
    if (prefsStarting) return;
    setPrefsStarting(true);

    // Confetti celebration
    if (!reduceMotion) fireConfettiCelebration();

    // Build a play title from preferences
    const objectiveLabels = selectedObjectives
      .map((id) => OBJECTIVE_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean);
    const primaryObjective = customObjective.trim() || objectiveLabels[0] || 'Generate pipeline';
    const playTitle = `${primaryObjective} — ${territory}`;

    localStorage.setItem('sa.onboarding_completed', 'true');
    localStorage.setItem('sa.selected_territory', territory);
    localStorage.setItem('sa.selected_objective', selectedObjectives.join(',') || customObjective);

    const now = new Date().toISOString();
    const starterPlay: Job = {
      id: 'play_001',
      kind: 'tracked',
      type: 'PRIORITIZE_ACCOUNTS',
      title: playTitle,
      status: 'RUNNING',
      has_unread_results: false,
      createdAt: now,
      updatedAt: now,
      last_viewed_at: null,
      expires_at: null,
      archived_at: null,
      schedule: null,
      linked_context: null,
      evidenceId: 'ev_prioritize_reasoning',
      messages: [
        {
          id: 'msg_play_start',
          role: 'agent',
          timestamp: now,
          content: `Let's build your first Play. I'll tailor **${playTitle}** in two quick steps.\n\nStarting by prioritizing accounts based on signals, CRM data, and engagement patterns.`,
        },
      ],
      scope: { territory },
      spawnedJobIds: [],
      progressStages: [
        'Analyzing CRM data',
        'Scoring intent signals',
        'Ranking accounts by priority',
        'Finalizing top accounts',
      ],
      currentStage: 0,
    };

    localStorage.setItem('sa.active_play_id', 'play_001');
    createJobDirect(starterPlay);

    setTimeout(() => {
      selectJob('play_001');
      setCurrentEvidence('ev_prioritize_reasoning');
    }, 450);

    const { addMessage, updateJob } = useJobStore.getState();
    setTimeout(() => {
      addMessage('play_001', {
        id: `msg_accounts_ready_${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toISOString(),
        content: `Done. I analyzed **134 accounts** and found **20 with the strongest buying signals**. They\u2019re ranked by composite signal score on the right.\n\nYou can refine this list \u2014 try asking me to filter by specific signals or criteria.`,
      });
      updateJob('play_001', {
        status: 'NEEDS_INPUT',
        has_unread_results: true,
        evidenceId: 'ev_prioritize_accounts',
        nextSuggestions: [
          { id: 'ns_leadership_60', title: 'Show me only accounts with leadership changes in the past 60 days', why: 'Leadership changes create the best timing for outreach', cta: 'Filter', prompt: 'Show me only accounts with leadership changes in the past 60 days' },
        ],
        askSuggestions: [
          { id: 'as_untouched', question: 'Only show me accounts that I haven\'t touched in 30 days', why: 'Focus on accounts you haven\'t contacted recently' },
        ],
      });
    }, 3500);
  }, [prefsStarting, reduceMotion, territory, selectedObjectives, customObjective, selectJob, setCurrentEvidence, createJobDirect]);

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] py-[24px]">
      <div className="flex w-full max-w-[520px] flex-col gap-[24px] rounded-[12px] bg-white p-[40px] shadow-lg">

        {/* Logo + title — only on starter screen */}
        {mode === 'starter' && (
          <div className="flex items-center gap-[16px]">
            <img src={inlogoPng} alt="LinkedIn" className="h-[28px] w-auto" />
            <h1 className="font-display text-[24px] font-semibold leading-tight text-li-text-primary">
              Your agent, made for prospecting
            </h1>
          </div>
        )}

        {/* Subtitle — only on starter */}
        {mode === 'starter' && (
          <div className="-mt-[12px] flex flex-col gap-[8px]">
            <p className="font-body text-[15px] leading-[1.6] text-li-text-secondary">
              Built on signals + Network Intelligence.
            </p>
            <p className="font-body text-[15px] leading-[1.6] text-li-text-secondary">
              Prioritizes accounts, finds leads, and orchestrates outreach.
            </p>
            <p className="font-body text-[15px] leading-[1.6] text-li-text-secondary">
              You're in control. Nothing sends without your approval.
            </p>
          </div>
        )}

        {/* Divider */}
        {mode === 'starter' && <div className="h-px bg-li-border-standard" />}

        {/* ─── Starter cards view ──────────────────────── */}
        {mode === 'starter' && (
          <div className="flex flex-col gap-[14px]">
            <div className="flex flex-col gap-[4px]">
              <div className="flex items-center gap-[6px]">
                <Zap size={15} className="text-li-blue" />
                <h2 className="font-display text-[18px] font-semibold text-li-text-primary">
                  Run your first <span className="text-li-blue">Play</span>
                </h2>
              </div>
              <p className="font-body text-[13px] text-li-text-tertiary">
                Pick a quick starting point, you can tailor it in chat.
              </p>
            </div>

            <div className="flex flex-col gap-[10px]">
              {STARTER_PLAY_INTENTS.map((intent) => {
                const isStarting = startingIntent === intent.intentKey;
                const isDisabled = startingIntent !== null && !isStarting;
                return (
                  <MissionCard
                    key={intent.intentKey}
                    intent={intent}
                    starting={isStarting}
                    hovered={hoverId === intent.intentKey}
                    disabled={isDisabled}
                    reduceMotion={!!reduceMotion}
                    onClick={() => handleCardClick(intent)}
                    onHover={(v) => setHoverId(v ? intent.intentKey : null)}
                  />
                );
              })}
            </div>

            <button
              onClick={() => setMode('prefs_territory')}
              className="self-center font-body text-[13px] font-medium text-li-text-tertiary transition-colors hover:text-li-blue"
            >
              I&apos;ll share my preferences instead
            </button>
          </div>
        )}

        {/* ─── Preferences: Territory (step 1) ────────── */}
        {mode === 'prefs_territory' && (
          <PrefsTerritory
            territory={territory}
            setTerritory={setTerritory}
            onNext={() => setMode('prefs_objective')}
            onBack={() => setMode('starter')}
          />
        )}

        {/* ─── Preferences: Objectives (step 2) ──────── */}
        {mode === 'prefs_objective' && (
          <PrefsObjective
            selectedObjectives={selectedObjectives}
            toggleObjective={toggleObjective}
            customObjective={customObjective}
            setCustomObjective={setCustomObjective}
            roleNotes={roleNotes}
            setRoleNotes={setRoleNotes}
            workPrefs={workPrefs}
            setWorkPrefs={setWorkPrefs}
            onBack={() => setMode('prefs_territory')}
            onFinish={handlePrefsFinish}
          />
        )}
      </div>
    </div>
  );
}
