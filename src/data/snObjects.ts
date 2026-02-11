/* ─── Touches (for "deprioritize touched <30d" logic) ─── */

export interface Touch {
  accountId: string;
  lastTouchedAt: string;
  type: string;
}

export const seedTouches: Touch[] = [
  { accountId: 'acc_06', lastTouchedAt: '2026-02-03T12:05:00-08:00', type: 'Viewed account' },
  { accountId: 'acc_08', lastTouchedAt: '2026-02-01T09:35:00-08:00', type: 'Saved lead' },
  { accountId: 'acc_02', lastTouchedAt: '2026-01-15T15:10:00-08:00', type: 'Sent InMail' },
];

/* ─── SN Objects (saved lists, preferences) ─── */

export interface SavedList {
  id: string;
  name: string;
  type: 'accounts' | 'leads';
  entityIds: string[];
}

export interface RankingRules {
  deprioritizeTouchedWithinDays: number;
  intentWeight: 'low' | 'medium' | 'high';
  preferSeniority: string;
}

export interface OutreachGuardrails {
  approvalRequired: boolean;
  tone: 'concise' | 'warm' | 'direct';
}

export interface SNObjects {
  savedAccounts: string[];
  savedLeads: string[];
  lists: SavedList[];
  preferences: {
    rankingRules: RankingRules;
    outreachGuardrails: OutreachGuardrails;
  };
}

export const seedSNObjects: SNObjects = {
  savedAccounts: ['acc_02', 'acc_01', 'acc_03', 'acc_04', 'acc_05', 'acc_06', 'acc_08'],
  savedLeads: ['ld_903', 'ld_917', 'ld_908'],
  lists: [
    {
      id: 'list_west_smb_top',
      name: 'West SMB — Top Accounts',
      type: 'accounts',
      entityIds: ['acc_02', 'acc_01', 'acc_03', 'acc_04'],
    },
  ],
  preferences: {
    rankingRules: {
      deprioritizeTouchedWithinDays: 30,
      intentWeight: 'medium',
      preferSeniority: 'VP+',
    },
    outreachGuardrails: {
      approvalRequired: true,
      tone: 'concise',
    },
  },
};

/* ─── Pile helpers (for quick UI rendering) ─── */

export const pileHelpers = {
  /** Account IDs for "hot accounts" logo pile */
  hotAccountsLogos: ['acc_02', 'acc_01', 'acc_03', 'acc_04'] as string[],
  /** Lead IDs for drafts facepile */
  draftsFacepile: ['ld_901', 'ld_903', 'ld_905', 'ld_912'] as string[],
  /** Lead IDs for approvals facepile */
  approvalsFacepile: ['ld_901', 'ld_903', 'ld_905', 'ld_910'] as string[],
};
