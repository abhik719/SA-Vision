import type { Evidence } from '../../types/evidence';
import Button from '../ui/Button';
import { AlertCircle, Link2, Target, Bookmark, RefreshCw } from 'lucide-react';

const ACTION_ICONS = {
  CONNECT_CRM: Link2,
  PICK_SCOPE: Target,
  USE_SAVED: Bookmark,
  RETRY: RefreshCw,
  CUSTOM: AlertCircle,
} as const;

interface Props {
  evidence: Evidence;
}

export default function NeedsAttentionView({ evidence }: Props) {
  const items = evidence.attentionItems || [];
  const reason = evidence.attentionReason || 'This job needs your input to continue.';

  return (
    <div
      className="flex h-full flex-col overflow-y-auto li-scrollbar"
      style={{
        padding:
          'var(--evidence-padding-top) var(--evidence-padding-x) var(--evidence-padding-bottom)',
      }}
    >
      <div
        className="flex w-full flex-col gap-[24px]"
        style={{ maxWidth: 'var(--evidence-max-width)' }}
      >
        {/* Top callout: what's missing + why it matters */}
        <div className="flex items-start gap-[12px] rounded-ds-card bg-[#FFF3E0] px-[16px] py-[14px]">
          <AlertCircle size={20} className="mt-[1px] shrink-0 text-[#C37D16]" />
          <div className="flex flex-col gap-[4px]">
            <span className="font-body text-[14px] font-semibold text-li-text-primary">
              Action needed
            </span>
            <p className="font-body text-[13px] leading-relaxed text-li-text-secondary">
              {reason}
            </p>
          </div>
        </div>

        {/* One-click fixes */}
        <div className="flex flex-col gap-[12px]">
          {items.map((item) => {
            const Icon = ACTION_ICONS[item.actionType] || AlertCircle;
            return (
              <div
                key={item.id}
                className="li-card flex items-center gap-[16px] px-[20px] py-[16px]"
              >
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-ds-card bg-li-bg-tertiary">
                  <Icon size={20} className="text-li-blue" />
                </div>
                <div className="flex flex-1 flex-col gap-[2px]">
                  <span className="font-body text-[14px] font-semibold text-li-text-primary">
                    {item.label}
                  </span>
                  <span className="font-body text-[13px] text-li-text-tertiary">
                    {item.description}
                  </span>
                </div>
                <Button size="sm">{item.actionLabel}</Button>
              </div>
            );
          })}
        </div>

        {/* Fallback when no items */}
        {items.length === 0 && (
          <div className="li-card flex flex-col items-center gap-[12px] px-[24px] py-[32px]">
            <AlertCircle size={32} className="text-li-text-disabled" />
            <span className="font-body text-[14px] text-li-text-tertiary">
              Something went wrong. Try refreshing or adjusting the scope.
            </span>
            <Button size="sm" variant="secondary">
              <RefreshCw size={12} className="mr-[4px]" /> Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
