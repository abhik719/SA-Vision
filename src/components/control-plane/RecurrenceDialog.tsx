import { useState, useRef, useEffect } from 'react';
import { RefreshCw, X, Check } from 'lucide-react';
import { useJobStore } from '../../store/useJobStore';
import type { JobSchedule } from '../../types/job';

interface Props {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

const FREQUENCY_OPTIONS: { value: JobSchedule['frequency']; label: string; description: string }[] = [
  { value: 'daily', label: 'Every day', description: 'Runs once daily at your preferred time' },
  { value: 'weekly', label: 'Every week', description: 'Runs once a week on a chosen day' },
  { value: 'monthly', label: 'Every month', description: 'Runs once a month on a chosen day' },
];

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function RecurrenceDialog({ jobId, jobTitle, onClose }: Props) {
  const [frequency, setFrequency] = useState<JobSchedule['frequency']>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [confirmed, setConfirmed] = useState(false);
  const updateJob = useJobStore((s) => s.updateJob);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleConfirm = () => {
    const now = new Date();
    const nextRun = new Date(now);
    if (frequency === 'daily') {
      nextRun.setDate(nextRun.getDate() + 1);
    } else if (frequency === 'weekly') {
      const dayIndex = DAY_OPTIONS.indexOf(dayOfWeek);
      const currentDay = now.getDay();
      const targetDay = dayIndex + 1; // Monday=1
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      nextRun.setDate(nextRun.getDate() + daysUntil);
    } else {
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setDate(1);
    }

    const schedule: JobSchedule = {
      is_active: true,
      frequency,
      dayOfWeek: frequency !== 'daily' ? dayOfWeek : undefined,
      time: '09:00',
      next_run_at: nextRun.toISOString(),
    };

    updateJob(jobId, {
      schedule,
      status: 'QUEUED',
    });

    setConfirmed(true);
    setTimeout(onClose, 1200);
  };

  if (confirmed) {
    return (
      <div
        ref={dialogRef}
        className="absolute left-1/2 top-[80px] z-50 w-[320px] -translate-x-1/2 rounded-[12px] border border-li-border-standard bg-white p-[20px] shadow-xl"
      >
        <div className="flex flex-col items-center gap-[12px] py-[8px]">
          <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-green-50">
            <Check size={20} className="text-green-600" />
          </div>
          <p className="text-center font-body text-[13px] font-medium text-li-text-primary">
            Scheduled! This play will run {frequency === 'daily' ? 'every day' : frequency === 'weekly' ? `every ${dayOfWeek}` : 'monthly'} at 9:00 AM.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dialogRef}
      className="absolute left-1/2 top-[80px] z-50 w-[320px] -translate-x-1/2 rounded-[12px] border border-li-border-standard bg-white shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-li-border-standard px-[16px] py-[12px]">
        <div className="flex items-center gap-[8px]">
          <RefreshCw size={14} className="text-li-blue" />
          <span className="font-body text-[13px] font-semibold text-li-text-primary">Make recurring</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-[2px] text-li-text-tertiary hover:bg-li-bg-hover hover:text-li-text-primary"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-[14px] px-[16px] py-[14px]">
        <p className="font-body text-[12px] text-li-text-secondary leading-relaxed">
          Run <span className="font-medium text-li-text-primary">{jobTitle}</span> on a schedule. It will be queued automatically each cycle.
        </p>

        {/* Frequency picker */}
        <div className="flex flex-col gap-[6px]">
          <label className="font-body text-[11px] font-semibold uppercase tracking-wider text-li-text-tertiary">
            Frequency
          </label>
          <div className="flex gap-[6px]">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFrequency(opt.value)}
                className={`flex-1 rounded-[8px] border px-[10px] py-[8px] text-center font-body text-[12px] font-medium transition-all ${
                  frequency === opt.value
                    ? 'border-li-blue bg-li-blue/5 text-li-blue'
                    : 'border-li-border-standard text-li-text-secondary hover:border-li-text-tertiary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Day picker (for weekly/monthly) */}
        {frequency !== 'daily' && (
          <div className="flex flex-col gap-[6px]">
            <label className="font-body text-[11px] font-semibold uppercase tracking-wider text-li-text-tertiary">
              {frequency === 'weekly' ? 'Day of week' : 'Day of month'}
            </label>
            {frequency === 'weekly' ? (
              <div className="flex gap-[4px]">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setDayOfWeek(day)}
                    className={`flex-1 rounded-[6px] border px-[4px] py-[6px] text-center font-body text-[11px] font-medium transition-all ${
                      dayOfWeek === day
                        ? 'border-li-blue bg-li-blue/5 text-li-blue'
                        : 'border-li-border-standard text-li-text-secondary hover:border-li-text-tertiary'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="rounded-[6px] border border-li-border-standard px-[8px] py-[6px] font-body text-[12px] text-li-text-primary"
              >
                {['1st', '15th'].map((d) => (
                  <option key={d} value={d}>{d} of each month</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-[8px] border-t border-li-border-standard px-[16px] py-[10px]">
        <button
          onClick={onClose}
          className="rounded-[6px] px-[12px] py-[6px] font-body text-[12px] font-medium text-li-text-secondary hover:bg-li-bg-hover"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="rounded-[6px] bg-li-blue px-[14px] py-[6px] font-body text-[12px] font-semibold text-white transition-colors hover:bg-li-blue-dark"
        >
          Schedule
        </button>
      </div>
    </div>
  );
}
