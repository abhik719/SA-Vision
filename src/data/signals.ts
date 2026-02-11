export interface Signal {
  id: string;
  bucket: 'Intent' | 'People' | 'Company' | 'PipelineRisk';
  accountId: string;
  type: 'TOPIC_SPIKE' | 'EXEC_JOINED' | 'EXEC_LEFT' | 'HIRING_TREND' | 'DECISION_MAKER_LEFT';
  title: string;
  detail: string;
  confidence: 'high' | 'medium' | 'low';
  whyNow: string[];
  timestamp: string;
}

export const seedSignals: Signal[] = [
  {
    id: 'sig_001',
    bucket: 'Intent',
    accountId: 'acc_02',
    type: 'TOPIC_SPIKE',
    title: 'Intent spike: CRM modernization',
    detail: 'Surge in engagement on CRM modernization topics',
    confidence: 'high',
    whyNow: ['3 topic surges in 72h', 'In-market peers engaging', 'Hiring RevOps roles'],
    timestamp: '2026-02-09T18:10:00-08:00',
  },
  {
    id: 'sig_002',
    bucket: 'People',
    accountId: 'acc_01',
    type: 'EXEC_JOINED',
    title: 'New VP Finance joined',
    detail: 'Joined from Snowflake; likely budget owner',
    confidence: 'high',
    whyNow: ['Matches CFO/VP Finance persona', 'New leader = reset window'],
    timestamp: '2026-02-08T10:40:00-08:00',
  },
  {
    id: 'sig_003',
    bucket: 'Company',
    accountId: 'acc_03',
    type: 'HIRING_TREND',
    title: 'Hiring ramp in Analytics',
    detail: '+9% Data/Analytics roles in last 30d',
    confidence: 'medium',
    whyNow: ['Signals investment cycle', 'Likely tooling changes'],
    timestamp: '2026-02-07T13:05:00-08:00',
  },
  {
    id: 'sig_004',
    bucket: 'PipelineRisk',
    accountId: 'acc_04',
    type: 'DECISION_MAKER_LEFT',
    title: 'SVP Sales left company',
    detail: 'Champion risk; remap buying committee',
    confidence: 'high',
    whyNow: ['High consequence for deal health'],
    timestamp: '2026-02-09T09:20:00-08:00',
  },
  {
    id: 'sig_005',
    bucket: 'Intent',
    accountId: 'acc_01',
    type: 'TOPIC_SPIKE',
    title: 'Intent spike: Salesforce replacement',
    detail: 'Rising engagement on competitive evaluation topics',
    confidence: 'medium',
    whyNow: ['Competitive window', 'RevOps hiring trend'],
    timestamp: '2026-02-09T16:30:00-08:00',
  },
  {
    id: 'sig_006',
    bucket: 'People',
    accountId: 'acc_05',
    type: 'EXEC_JOINED',
    title: 'New CRO joined',
    detail: 'Likely to revisit tooling + pipeline',
    confidence: 'medium',
    whyNow: ['New exec = new priorities', 'SDR hiring ramp'],
    timestamp: '2026-02-06T11:10:00-08:00',
  },
];

/** Get signals for a specific account */
export function getSignalsForAccount(accountId: string): Signal[] {
  return seedSignals.filter((s) => s.accountId === accountId);
}
