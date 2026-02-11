import { Pin, Download, ExternalLink } from 'lucide-react';

interface Props {
  breadcrumb: string;
  title: string;
}

export default function EvidenceHeader({ breadcrumb, title }: Props) {
  return (
    <div
      className="flex shrink-0 flex-col bg-white"
      style={{ borderBottom: '1px solid var(--border-standard)' }}
    >
      {/* Breadcrumb row */}
      <div className="px-[24px] pt-[12px]">
        <span className="font-body text-[12px] text-li-text-tertiary">
          {breadcrumb}
        </span>
      </div>

      {/* Title row: 8px below breadcrumb */}
      <div className="flex items-center justify-between px-[24px] pt-[8px] pb-[12px]">
        <h3 className="font-display text-[18px] font-semibold leading-snug text-li-text-primary">
          {title}
        </h3>
        <div className="flex items-center gap-[8px]">
          <button
            className="rounded p-[6px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
            title="Pin"
          >
            <Pin size={16} />
          </button>
          <button
            className="rounded p-[6px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
            title="Export (mock)"
          >
            <Download size={16} />
          </button>
          <button
            className="rounded p-[6px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
            title="Open in new (mock)"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
