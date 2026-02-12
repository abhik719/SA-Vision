import type { Evidence } from '../../types/evidence';
import Button from '../ui/Button';
import { TERMS } from '../../constants/terms';
import { Play, Save } from 'lucide-react';

interface Props {
  evidence: Evidence;
}

export default function ConfigurationView({ evidence }: Props) {
  const fields = evidence.configFields || [];
  const previewLabel = evidence.previewLabel || 'Preview of what you will get';

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
        {/* Split: config form (left) + preview (right) */}
        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[1fr_340px]">
          {/* Left: config form */}
          <div className="flex flex-col gap-[20px]">
            <div className="li-card flex flex-col gap-[16px] p-[20px]">
              <h4 className="font-body text-ds-base font-semibold text-li-text-primary">
                {TERMS.PLAY_CONFIGURATION}
              </h4>

              {fields.map((field) => (
                <div key={field.id} className="flex flex-col gap-[4px]">
                  <label className="font-body text-[12px] font-semibold text-li-text-tertiary">
                    {field.label}
                  </label>
                  {field.type === 'select' || field.type === 'multi-select' ? (
                    <select
                      className="rounded-[6px] border border-li-border-standard bg-white px-[10px] py-[8px] font-body text-ds-base text-li-text-primary focus:border-li-blue focus:outline-none"
                      defaultValue={field.value}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      defaultValue={field.value}
                      className="rounded-[6px] border border-li-border-standard bg-white px-[10px] py-[8px] font-body text-ds-base text-li-text-primary focus:border-li-blue focus:outline-none"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="rounded-[6px] border border-li-border-standard bg-white px-[10px] py-[8px] font-body text-ds-base text-li-text-primary focus:border-li-blue focus:outline-none"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}

              {/* Fallback when no fields */}
              {fields.length === 0 && (
                <div className="flex flex-col gap-[16px]">
                  {/* Scope */}
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-body text-[12px] font-semibold text-li-text-tertiary">
                      Scope
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., West SMB book, Top 10 accounts"
                      className="rounded-[6px] border border-li-border-standard bg-white px-[10px] py-[8px] font-body text-ds-base text-li-text-primary focus:border-li-blue focus:outline-none"
                    />
                  </div>
                  {/* Personas */}
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-body text-[12px] font-semibold text-li-text-tertiary">
                      Target personas
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., VP Sales, Director of RevOps"
                      className="rounded-[6px] border border-li-border-standard bg-white px-[10px] py-[8px] font-body text-ds-base text-li-text-primary focus:border-li-blue focus:outline-none"
                    />
                  </div>
                  {/* Guardrails */}
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-body text-[12px] font-semibold text-li-text-tertiary">
                      Guardrails
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Skip contacts touched <30 days"
                      className="rounded-[6px] border border-li-border-standard bg-white px-[10px] py-[8px] font-body text-ds-base text-li-text-primary focus:border-li-blue focus:outline-none"
                    />
                  </div>
                  {/* Cadence */}
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-body text-[12px] font-semibold text-li-text-tertiary">
                      Cadence
                    </label>
                    <select className="rounded-[6px] border border-li-border-standard bg-white px-[10px] py-[8px] font-body text-ds-base text-li-text-primary focus:border-li-blue focus:outline-none">
                      <option>One-time</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Primary + secondary CTAs */}
            <div className="flex items-center gap-[10px]">
              <Button>
                <Play size={14} className="mr-[6px]" /> {TERMS.RUN_PLAY}
              </Button>
              <Button variant="secondary">
                <Save size={14} className="mr-[6px]" /> Save as template
              </Button>
            </div>
          </div>

          {/* Right: preview placeholder */}
          <div className="flex flex-col gap-[12px]">
            <div className="li-card flex flex-col gap-[12px] p-[20px]">
              <h4 className="font-body text-[12px] font-semibold uppercase tracking-wider text-li-text-tertiary">
                Preview
              </h4>
              <p className="font-body text-ds-small text-li-text-tertiary">
                {previewLabel}
              </p>

              {/* Skeleton preview */}
              <div className="flex flex-col gap-[8px]">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-[12px]">
                    <div className="h-[10px] w-[100px] animate-pulse rounded bg-li-tag-bg" />
                    <div className="h-[10px] w-[60px] animate-pulse rounded bg-li-tag-bg" />
                    <div className="h-[10px] w-[140px] animate-pulse rounded bg-li-tag-bg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
