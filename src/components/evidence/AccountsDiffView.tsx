import type { Evidence } from '../../types/evidence';
import EvidenceHeader from './EvidenceHeader';
import {
  UserPlus,
  TrendingUp,
  Users,
  DollarSign,
  Newspaper,
  Building,
  Zap,
  Activity,
} from 'lucide-react';

const CHANGE_ICONS: Record<string, typeof UserPlus> = {
  EXEC_MOVE: UserPlus,
  INTENT_SPIKE: TrendingUp,
  HIRING: Users,
  FUNDING: DollarSign,
  NEWS: Newspaper,
  EXPANSION: Building,
  ENGAGEMENT: Activity,
  COMPETITOR: Zap,
};

const CHANGE_COLORS: Record<string, string> = {
  EXEC_MOVE: '#0A66C2',
  INTENT_SPIKE: '#2F7B15',
  HIRING: '#C37D16',
  FUNDING: '#2F7B15',
  NEWS: '#0A66C2',
  EXPANSION: '#C37D16',
  ENGAGEMENT: '#2F7B15',
  COMPETITOR: '#CC1016',
};

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

export default function AccountsDiffView({ evidence, hideHeader }: Props) {
  const diffs = evidence.diffs || [];

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader
          breadcrumb="Thread • Evidence"
          title={evidence.title}
        />
      )}

      <div className="flex-1 overflow-y-auto li-scrollbar" style={{ padding: 'var(--evidence-padding-top) var(--evidence-padding-x) var(--evidence-padding-bottom)' }}>
        <div className="flex flex-col gap-[16px]" style={{ maxWidth: 'var(--evidence-max-width)' }}>
          {diffs.map((diff) => (
            <div key={diff.accountId} className="li-card p-[20px]">
              <div className="flex flex-col gap-[10px]">
                <h4 className="font-display text-ds-large font-semibold text-li-text-primary">
                  {diff.accountName}
                </h4>
                <div className="flex flex-col gap-[8px]">
                  {diff.changes.map((change, i) => {
                    const Icon = CHANGE_ICONS[change.type] || Zap;
                    const color = CHANGE_COLORS[change.type] || 'rgba(0,0,0,0.6)';
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-[8px]"
                      >
                        <div
                          className="mt-[2px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-ds-card"
                          style={{ background: `${color}15` }}
                        >
                          <Icon size={14} style={{ color }} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body text-ds-small font-semibold uppercase tracking-wide text-li-text-tertiary">
                            {change.type.replace(/_/g, ' ')}
                          </span>
                          <span className="font-body text-ds-base text-li-text-primary">
                            {change.detail}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
