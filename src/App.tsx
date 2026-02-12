import TopNav from './components/layout/TopNav';
import ResizableSplit from './components/layout/ResizableSplit';
import { AgentLeftRail } from './components/control-plane/AgentLeftRail';
import EvidencePane from './components/evidence/EvidencePane';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { useJobStore } from './store/useJobStore';
import { useEvidenceStore } from './store/useEvidenceStore';
import { useOutreachStore } from './store/useOutreachStore';
// seedJobs deliberately not imported — after onboarding, play_001 is the only job
import { seedEvidence } from './data/evidence';
import { seedLeadList, defaultOutreachPlan } from './data/outreachLeads';
import { runFindLeads, generateDrafts } from './demo/seed';

// ─── /onboarding route: reset everything and restart ───
function handleOnboardingRoute() {
  if (window.location.pathname === '/onboarding') {
    // Clear all persisted zustand stores
    localStorage.removeItem('sa-agent-app-v2');
    localStorage.removeItem('sa-agent-jobs-v2');
    localStorage.removeItem('sa-agent-evidence');
    localStorage.removeItem('sa-agent-outreach');
    localStorage.removeItem('sa-agent-signal-prefs');
    // Clear onboarding + seed version flags
    localStorage.removeItem('sa.onboarding_completed');
    localStorage.removeItem('sa.selected_territory');
    localStorage.removeItem('sa.selected_objective');
    localStorage.removeItem('sa.active_play_id');
    localStorage.removeItem('sa-data-version');
    // Redirect to root to start fresh
    window.location.replace('/');
  }
}
// Run immediately on script load (before React renders)
handleOnboardingRoute();

function useSeedData() {
  const initialized = useRef(false);
  const setJobs = useJobStore((s) => s.setJobs);
  const setEvidenceMap = useEvidenceStore((s) => s.setEvidenceMap);
  const setLeadLists = useOutreachStore((s) => s.setLeadLists);
  const setLeads = useOutreachStore((s) => s.setLeads);
  const setDrafts = useOutreachStore((s) => s.setDrafts);
  const setPlan = useOutreachStore((s) => s.setPlan);
  const jobsById = useJobStore((s) => s.jobsById);
  const evidenceById = useEvidenceStore((s) => s.evidenceById);
  const goOnboarding = useAppStore((s) => s.goOnboarding);
  const selectedView = useAppStore((s) => s.selectedView);

  useEffect(() => {
    if (initialized.current) return;

    const DATA_VERSION = 'v37-no-preseed-schedules';
    const storedVersion = localStorage.getItem('sa-data-version');
    const needsRefresh = storedVersion !== DATA_VERSION;

    const onboardingDone = localStorage.getItem('sa.onboarding_completed') === 'true';
    const jobCount = Object.keys(jobsById).length;

    // ── Seed evidence + outreach data (always needed) ──
    if (needsRefresh || Object.keys(evidenceById).length === 0) {
      setEvidenceMap(seedEvidence);
      setLeadLists([seedLeadList]);
      setLeads(runFindLeads());
      setDrafts(generateDrafts());
      setPlan('job_workspace_outreach', defaultOutreachPlan);
      localStorage.setItem('sa-data-version', DATA_VERSION);
    }

    // ── Seed jobs ──
    // After onboarding, play_001 is the ONLY play — don't load demo seed jobs.
    // The play_001 job is created during handleComplete in OnboardingFlow.
    // If the user has completed onboarding and play_001 exists, leave the store as-is.
    // If onboarding hasn't happened yet, ensure the store is empty.
    const hasPlayJob = !!jobsById['play_001'];

    if (!onboardingDone) {
      // Clear any leftover jobs so only play_001 appears after onboarding
      if (jobCount > 0) {
        setJobs([]);
      }
    } else if (!hasPlayJob && (jobCount === 0 || needsRefresh)) {
      // Edge case: onboarding flag is set but no play_001 exists
      // (e.g., manual localStorage edit) — reset to trigger onboarding again
      localStorage.removeItem('sa.onboarding_completed');
    }

    // Gate: if onboarding not completed, show onboarding
    if (!onboardingDone && selectedView !== 'ONBOARDING') {
      goOnboarding();
    }

    initialized.current = true;
  }, [setJobs, setEvidenceMap, setLeadLists, setLeads, setDrafts, setPlan, jobsById, evidenceById, goOnboarding, selectedView]);
}

export default function App() {
  useSeedData();
  const selectedView = useAppStore((s) => s.selectedView);

  if (selectedView === 'ONBOARDING') {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <TopNav />
        <div className="flex-1 overflow-hidden">
          <OnboardingFlow />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopNav />
      <div className="flex-1 overflow-hidden">
        <ResizableSplit left={<AgentLeftRail />} right={<EvidencePane />} />
      </div>
    </div>
  );
}
