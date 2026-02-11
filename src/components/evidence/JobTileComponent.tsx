import type { JobTile } from '../../types/evidence';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import Facepile from '../ui/Facepile';
import LogoPile from '../ui/LogoPile';

interface Props {
  tile: JobTile;
}

export default function JobTileComponent({ tile }: Props) {
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const selectJob = useAppStore((s) => s.selectJob);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const jobsById = useJobStore((s) => s.jobsById);

  const handleClick = () => {
    setActiveTab('JOBS');
    selectJob(tile.jobId);
    // Deep-link: use the job's evidenceId if available, else fall back to target state
    const job = jobsById[tile.jobId];
    if (job?.evidenceId) {
      setCurrentEvidence(job.evidenceId);
    }
  };

  const handleCta = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  // Build preview pile items
  const previewItems = tile.preview?.items || [];
  const facepileItems = tile.preview?.type === 'facepile'
    ? previewItems.map((p, i) => ({ id: `jt_fp_${tile.id}_${i}`, name: p.name, avatarUrl: p.imageUrl }))
    : [];
  const logopileItems = tile.preview?.type === 'logopile'
    ? previewItems.map((p, i) => ({ id: `jt_lp_${tile.id}_${i}`, name: p.name, logoUrl: p.imageUrl }))
    : [];
  const overflow = tile.preview?.overflowCount || 0;

  // Status pill text
  const statusText = tile.status === 'Running' && tile.eta
    ? `Running \u2022 ${tile.eta}`
    : tile.status;

  return (
    <div
      className="li-card flex cursor-pointer flex-col gap-[6px] p-[14px] transition-shadow hover:shadow-sm"
      onClick={handleClick}
    >
      {/* Row 1: Title + status pill */}
      <div className="flex items-center gap-[8px]">
        <span className="flex-1 truncate font-body text-ds-base font-semibold text-li-text-primary leading-snug">
          {tile.title}
        </span>
        <span className="shrink-0 rounded-[4px] bg-li-bg-tertiary px-[8px] py-[2px] font-body text-[11px] font-medium text-li-text-secondary">
          {statusText}
        </span>
      </div>

      {/* Row 2: Meta line */}
      <div className="flex flex-wrap items-center gap-[6px]">
        <span className="rounded-[4px] bg-li-bg-tertiary px-[6px] py-[1px] font-body text-[11px] text-li-text-secondary">
          {tile.jobTypeLabel}
        </span>
        {tile.scopeLabel && (
          <>
            <span className="font-body text-[11px] text-li-text-tertiary">&middot;</span>
            <span className="font-body text-[11px] text-li-text-tertiary">{tile.scopeLabel}</span>
          </>
        )}
        <span className="font-body text-[11px] text-li-text-tertiary">&middot;</span>
        <span className="font-body text-[11px] text-li-text-tertiary">Updated {tile.updated}</span>
      </div>

      {/* Row 3: Preview + CTA inline */}
      <div className="flex items-center gap-[8px]">
        <div className="flex flex-1 items-center gap-[6px]">
          {facepileItems.length > 0 && <Facepile items={facepileItems} max={4} size="sm" />}
          {logopileItems.length > 0 && <LogoPile items={logopileItems} max={4} size="sm" />}
          {overflow > 0 && (
            <span className="font-body text-[11px] text-li-text-tertiary">+{overflow}</span>
          )}
        </div>
        <button
          onClick={handleCta}
          className="shrink-0 rounded-ds-button bg-li-blue px-[14px] py-[4px] font-body text-ds-small font-semibold text-white transition-colors hover:bg-li-blue-dark"
        >
          {tile.primaryCta.label}
        </button>
      </div>
    </div>
  );
}
