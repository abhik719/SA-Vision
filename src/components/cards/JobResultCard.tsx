import type { JobResultCardData } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import Button from '../ui/Button';
import { Eye, RefreshCw, Send } from 'lucide-react';

interface Props {
  data: JobResultCardData;
}

export default function JobResultCard({ data }: Props) {
  const selectJob = useAppStore((s) => s.selectJob);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const jobsById = useJobStore((s) => s.jobsById);

  const handleReview = () => {
    const job = jobsById[data.jobId];
    setActiveTab('JOBS');
    selectJob(data.jobId);
    if (job?.evidenceId) {
      setCurrentEvidence(job.evidenceId);
    }
  };

  return (
    <div className="li-card max-w-[95%] p-[16px]">
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center gap-[6px]">
          <span className="font-body text-ds-base font-semibold text-li-text-primary">
            {data.jobTitle}
          </span>
          <span className="rounded-ds-spotlight bg-[#E8F5E9] px-[6px] py-[1px] font-body text-ds-small font-semibold text-[#2F7B15]">
            Done
          </span>
        </div>

        <ul className="flex flex-col gap-[2px]">
          {data.highlights.map((h, i) => (
            <li
              key={i}
              className="font-body text-ds-small text-li-text-secondary"
            >
              &bull; {h}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-[8px]">
          <Button onClick={handleReview} size="sm">
            <Eye size={12} className="mr-[4px]" /> Review results
          </Button>
          <Button variant="secondary" size="sm">
            <RefreshCw size={12} className="mr-[4px]" /> Refine &amp; rerun
          </Button>
          <Button variant="secondary" size="sm">
            <Send size={12} className="mr-[4px]" /> Start outreach
          </Button>
        </div>
      </div>
    </div>
  );
}
