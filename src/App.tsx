import TopNav from './components/layout/TopNav';
import ResizableSplit from './components/layout/ResizableSplit';
import ControlPlane from './components/control-plane/ControlPlane';
import EvidencePane from './components/evidence/EvidencePane';
import { useEffect, useRef } from 'react';
import { useThreadStore } from './store/useThreadStore';
import { useJobStore } from './store/useJobStore';
import { useEvidenceStore } from './store/useEvidenceStore';
import { useOutreachStore } from './store/useOutreachStore';
import { seedThreads } from './data/threads';
import { seedJobs } from './data/jobs';
import { seedEvidence } from './data/evidence';
import { seedOutreachLeads, seedLeadList, seedOutreachDrafts, defaultOutreachPlan } from './data/outreachLeads';

function useSeedData() {
  const initialized = useRef(false);
  const setThreads = useThreadStore((s) => s.setThreads);
  const setJobs = useJobStore((s) => s.setJobs);
  const setEvidenceMap = useEvidenceStore((s) => s.setEvidenceMap);
  const setLeadLists = useOutreachStore((s) => s.setLeadLists);
  const setLeads = useOutreachStore((s) => s.setLeads);
  const setDrafts = useOutreachStore((s) => s.setDrafts);
  const setPlan = useOutreachStore((s) => s.setPlan);
  const threadOrder = useThreadStore((s) => s.threadOrder);
  const evidenceById = useEvidenceStore((s) => s.evidenceById);

  useEffect(() => {
    if (initialized.current) return;

    const DATA_VERSION = 'v22-outreach-flow';
    const storedVersion = localStorage.getItem('sa-data-version');
    const needsRefresh = storedVersion !== DATA_VERSION;

    // Seed threads/jobs if store is empty or version changed
    if (threadOrder.length === 0 || needsRefresh) {
      setThreads(seedThreads);
      setJobs(seedJobs);
    }
    // Always refresh evidence + outreach data on version change
    if (needsRefresh) {
      setEvidenceMap(seedEvidence);
      // Seed outreach store
      setLeadLists([seedLeadList]);
      setLeads(seedOutreachLeads);
      setDrafts(seedOutreachDrafts);
      setPlan('job_outreach_01', defaultOutreachPlan);
      localStorage.setItem('sa-data-version', DATA_VERSION);
    }
    initialized.current = true;
  }, [setThreads, setJobs, setEvidenceMap, setLeadLists, setLeads, setDrafts, setPlan, threadOrder.length, evidenceById]);
}

export default function App() {
  useSeedData();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopNav />
      <div className="flex-1 overflow-hidden">
        <ResizableSplit left={<ControlPlane />} right={<EvidencePane />} />
      </div>
    </div>
  );
}
