import TopNav from './components/layout/TopNav';
import ResizableSplit from './components/layout/ResizableSplit';
import ControlPlane from './components/control-plane/ControlPlane';
import EvidencePane from './components/evidence/EvidencePane';
import { useEffect, useRef } from 'react';
import { useThreadStore } from './store/useThreadStore';
import { useJobStore } from './store/useJobStore';
import { useEvidenceStore } from './store/useEvidenceStore';
import { seedThreads } from './data/threads';
import { seedJobs } from './data/jobs';
import { seedEvidence } from './data/evidence';

function useSeedData() {
  const initialized = useRef(false);
  const setThreads = useThreadStore((s) => s.setThreads);
  const setJobs = useJobStore((s) => s.setJobs);
  const setEvidenceMap = useEvidenceStore((s) => s.setEvidenceMap);
  const threadOrder = useThreadStore((s) => s.threadOrder);
  const evidenceById = useEvidenceStore((s) => s.evidenceById);

  useEffect(() => {
    if (initialized.current) return;

    const DATA_VERSION = 'v21-demo-flows-pills';
    const storedVersion = localStorage.getItem('sa-data-version');
    const needsRefresh = storedVersion !== DATA_VERSION;

    // Seed threads/jobs if store is empty or version changed
    if (threadOrder.length === 0 || needsRefresh) {
      setThreads(seedThreads);
      setJobs(seedJobs);
    }
    // Always refresh evidence on version change
    if (needsRefresh) {
      setEvidenceMap(seedEvidence);
      localStorage.setItem('sa-data-version', DATA_VERSION);
    }
    initialized.current = true;
  }, [setThreads, setJobs, setEvidenceMap, threadOrder.length, evidenceById]);
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
