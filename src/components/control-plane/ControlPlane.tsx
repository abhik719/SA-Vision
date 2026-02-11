import { useAppStore } from '../../store/useAppStore';
import { useThreadStore } from '../../store/useThreadStore';
import ThreadList from './ThreadList';
import ThreadContextStrip from './ThreadContextStrip';
import KeyActions from './KeyActions';
import ChatTranscript from './ChatTranscript';
import ContextualSuggestions from './ContextualSuggestions';
import Composer from './Composer';
import JobList from './JobList';
import { Home } from 'lucide-react';
import { processSellerMessage } from '../../flows/engine';
import clsx from 'clsx';

const TABS = [
  { id: 'THREADS' as const, label: 'Threads' },
  { id: 'JOBS' as const, label: 'Jobs' },
];

export default function ControlPlane() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const selectedView = useAppStore((s) => s.selectedView);
  const selectedThreadId = useAppStore((s) => s.selectedThreadId);
  const goHome = useAppStore((s) => s.goHome);
  const addMessage = useThreadStore((s) => s.addMessage);
  const thread = useThreadStore((s) =>
    selectedThreadId ? s.threadsById[selectedThreadId] : null
  );

  const isHome = selectedView === 'HOME';
  const isThread = selectedView === 'THREAD' && !!thread;

  const handleSend = (text: string) => {
    if (!selectedThreadId) return;
    addMessage(selectedThreadId, {
      id: `msg_${Date.now()}`,
      role: 'seller',
      timestamp: new Date().toISOString(),
      content: text,
    });
    processSellerMessage(selectedThreadId, text);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Fixed header: Tabs + Home — always visible */}
      <div
        className="flex shrink-0 items-center gap-[4px] px-[16px]"
        style={{ borderBottom: '1px solid var(--border-standard)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'relative flex h-[44px] items-center px-[8px] font-body text-ds-base font-semibold transition-colors',
              activeTab === tab.id
                ? 'border-b-[3px] border-black text-li-text-primary'
                : 'text-li-text-tertiary hover:text-li-text-secondary'
            )}
          >
            {tab.label}
          </button>
        ))}

        <button
          onClick={goHome}
          className={clsx(
            'ml-auto flex h-[30px] w-[30px] items-center justify-center rounded-ds-card transition-colors',
            isHome
              ? 'bg-li-bg-tertiary text-li-blue'
              : 'text-li-text-tertiary hover:bg-li-bg-hover hover:text-li-text-secondary'
          )}
          title="Back to Today"
        >
          <Home size={16} />
        </button>
      </div>

      {/* Content below fixed header */}
      {isThread && activeTab === 'THREADS' ? (
        /* Thread selected: header → key actions → chat → suggestions → input */
        <div className="flex flex-1 flex-col overflow-hidden">
          <ThreadContextStrip thread={thread} />
          <KeyActions thread={thread} />
          <ChatTranscript thread={thread} />
          <ContextualSuggestions thread={thread} onSend={handleSend} />
          <Composer onSend={handleSend} />
        </div>
      ) : (
        /* Normal tab content */
        <div className="flex-1 overflow-hidden">
          {activeTab === 'THREADS' ? <ThreadList /> : <JobList />}
        </div>
      )}
    </div>
  );
}
