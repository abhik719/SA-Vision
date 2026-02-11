import { Gift, HelpCircle, Bell } from 'lucide-react';
import snLogo from '../../assets/snlogo.png';

interface NavTab {
  id: string;
  label: string;
  enabled: boolean;
}

const tabs: NavTab[] = [
  { id: 'agent', label: 'Agent', enabled: true },
  { id: 'leads', label: 'Leads', enabled: false },
  { id: 'accounts', label: 'Accounts', enabled: false },
  { id: 'signals', label: 'Signals', enabled: false },
  { id: 'preferences', label: 'Preferences', enabled: false },
];

export default function TopNav() {
  return (
    <nav
      className="sticky top-0 z-50 flex h-[56px] w-full items-center bg-white"
      style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}
    >
      {/* Left: SN Logo */}
      <div className="flex items-center pl-[16px]">
        <img
          src={snLogo}
          alt="Sales Navigator"
          className="h-[28px] w-auto"
        />
      </div>

      {/* Center: Tabs */}
      <div className="ml-[40px] flex h-[56px] items-center gap-[4px]">
        {tabs.map((tab) => {
          const isActive = tab.enabled;
          return (
            <button
              key={tab.id}
              className={`relative flex h-[55px] items-center px-[8px] font-nav text-[16px] font-semibold transition-colors ${
                isActive
                  ? 'border-b-4 border-black text-li-text-primary'
                  : 'cursor-not-allowed text-li-text-secondary opacity-50'
              }`}
              disabled={!tab.enabled}
              title={!tab.enabled ? 'Coming soon (prototype)' : undefined}
              style={{ letterSpacing: '-0.15px', lineHeight: '1.25' }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Icons + avatar */}
      <div className="ml-auto flex h-[56px] items-center gap-[18px] pr-[17px]">
        <Gift
          size={24}
          className="shrink-0"
          style={{ color: 'rgba(0, 0, 0, 0.6)' }}
        />
        {/* Vertical divider */}
        <div
          className="h-full w-px shrink-0"
          style={{ background: 'rgba(0, 0, 0, 0.08)' }}
          aria-hidden="true"
        />
        <HelpCircle
          size={24}
          className="shrink-0"
          style={{ color: 'rgba(0, 0, 0, 0.6)' }}
        />
        <Bell
          size={24}
          className="shrink-0"
          style={{ color: 'rgba(0, 0, 0, 0.6)' }}
        />
        {/* User avatar placeholder */}
        <div
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-ds-circle text-[12px] font-semibold text-white"
          style={{ background: 'rgba(250, 0, 133, 0.55)' }}
        >
          AK
        </div>
      </div>
    </nav>
  );
}
