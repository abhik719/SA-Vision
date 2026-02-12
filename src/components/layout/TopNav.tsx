import { useState, useRef, useEffect } from 'react';
import { Gift, HelpCircle, Bell, Users, Building2, Radio, Settings, ChevronDown } from 'lucide-react';
import snLogo from '../../assets/snlogo.png';

const PROFILE_MENU_ITEMS = [
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'signals', label: 'Signals', icon: Radio },
  { id: 'preferences', label: 'Preferences', icon: Settings },
];

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

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
      <div className="ml-[24px] flex h-[56px] items-stretch">
        {/* Home tab — active */}
        <button className="relative flex items-center px-[16px] font-display text-[14px] font-semibold text-li-text-primary">
          Home
          <span className="absolute bottom-0 left-[12px] right-[12px] h-[2px] bg-li-text-primary" />
        </button>
        {/* Messaging tab — inactive */}
        <button className="relative flex items-center px-[16px] font-display text-[14px] font-medium text-li-text-tertiary cursor-default">
          Messaging
        </button>
      </div>

      {/* Right: Icons + Profile menu */}
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

        {/* Profile avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-[6px] rounded-full transition-colors hover:bg-[#f5f5f5] p-[2px] pr-[6px]"
          >
            <div
              className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-ds-circle text-[12px] font-semibold text-white"
              style={{ background: 'rgba(250, 0, 133, 0.55)' }}
            >
              AK
            </div>
            <ChevronDown
              size={14}
              className={`shrink-0 text-li-text-secondary transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] w-[220px] rounded-[8px] border bg-white py-[4px] shadow-lg"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            >
              {/* User info header */}
              <div className="px-[16px] py-[10px] border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <p className="font-body text-[14px] font-semibold text-li-text-primary">Akash Kasamne</p>
                <p className="font-body text-[12px] text-li-text-secondary">Sales Navigator</p>
              </div>

              {/* Menu items */}
              <div className="py-[4px]">
                {PROFILE_MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className="flex w-full items-center gap-[10px] px-[16px] py-[8px] font-body text-[13px] text-li-text-secondary transition-colors hover:bg-[#f5f5f5] hover:text-li-text-primary"
                      title="Coming soon (prototype)"
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{item.label}</span>
                      <span className="ml-auto rounded-[4px] bg-[#f0f0f0] px-[6px] py-[1px] text-[10px] text-li-text-disabled">Soon</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
