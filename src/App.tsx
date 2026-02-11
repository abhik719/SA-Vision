import TopNav from './components/layout/TopNav';
import ResizableSplit from './components/layout/ResizableSplit';
import { AgentLeftRail } from './components/control-plane/AgentLeftRail';
import EvidencePane from './components/evidence/EvidencePane';
import { useEffect, useRef } from 'react';
import { useJobStore } from './store/useJobStore';
import { useEvidenceStore } from './store/useEvidenceStore';
import { useOutreachStore } from './store/useOutreachStore';
import { seedJobs } from './data/jobs';
import { seedEvidence } from './data/evidence';
import { seedOutreachLeads, seedLeadList, seedOutreachDrafts, defaultOutreachPlan } from './data/outreachLeads';

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

  useEffect(() => {
    if (initialized.current) return;

    const DATA_VERSION = 'v33-conversational-filters';
    const storedVersion = localStorage.getItem('sa-data-version');
    const needsRefresh = storedVersion !== DATA_VERSION;

    const jobCount = Object.keys(jobsById).length;

    // Seed jobs if store is empty or version changed
    if (jobCount === 0 || needsRefresh) {
      setJobs(seedJobs);
    }
    // Always refresh evidence + outreach data on version change
    if (needsRefresh || Object.keys(evidenceById).length === 0) {
      setEvidenceMap(seedEvidence);
      setLeadLists([seedLeadList]);
      setLeads(seedOutreachLeads);
      setDrafts(seedOutreachDrafts);
      setPlan('job_workspace_outreach', defaultOutreachPlan);
      localStorage.setItem('sa-data-version', DATA_VERSION);
    }
    initialized.current = true;
  }, [setJobs, setEvidenceMap, setLeadLists, setLeads, setDrafts, setPlan, jobsById, evidenceById]);
}

export default function App() {
  useSeedData();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopNav />
      <div className="flex-1 overflow-hidden">
        <ResizableSplit left={<AgentLeftRail />} right={<EvidencePane />} />
      </div>
    </div>
  );
}
