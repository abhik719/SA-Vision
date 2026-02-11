export interface SignalsSummary {
  intentTopic: string;
  intentScore: number;
  recentExecMove: string;
  hiringTrend: string;
}

export interface Account {
  id: string;
  name: string;
  domain: string;
  industry: string;
  hq: string;
  employeeRange: string;
  tier: 'A' | 'B' | 'C';
  tags: string[];
  /** Legacy fields kept for backward compat */
  territory: string;
  crmStatus: string;
  signalsSummary: SignalsSummary;
}

export const seedAccounts: Account[] = [
  {
    id: 'acc_01',
    name: 'Acme Software',
    domain: 'acmesw.com',
    industry: 'B2B SaaS',
    hq: 'San Mateo, CA',
    employeeRange: '501–1,000',
    tier: 'A',
    tags: ['West SMB', 'B2B SaaS'],
    territory: 'West SMB',
    crmStatus: 'Active Opportunity',
    signalsSummary: {
      intentTopic: 'Salesforce replacement',
      intentScore: 78,
      recentExecMove: 'VP Finance joined from Snowflake',
      hiringTrend: '+12% RevOps roles (30d)',
    },
  },
  {
    id: 'acc_02',
    name: 'Northwind Traders',
    domain: 'nimbuslogistics.com',
    industry: 'Logistics & Supply Chain',
    hq: 'Austin, TX',
    employeeRange: '1,001–5,000',
    tier: 'A',
    tags: ['West SMB'],
    territory: 'West SMB',
    crmStatus: 'Prospect',
    signalsSummary: {
      intentTopic: 'CRM modernization',
      intentScore: 87,
      recentExecMove: 'New VP Revenue Ops hired',
      hiringTrend: '+18% Finance roles (30d)',
    },
  },
  {
    id: 'acc_03',
    name: 'Contoso Cloud',
    domain: 'quantahealth.io',
    industry: 'Healthcare IT',
    hq: 'Seattle, WA',
    employeeRange: '1,001–5,000',
    tier: 'B',
    tags: ['West SMB'],
    territory: 'West SMB',
    crmStatus: 'Active Opportunity',
    signalsSummary: {
      intentTopic: 'Revenue operations automation',
      intentScore: 74,
      recentExecMove: 'CIO promoted to President, Digital',
      hiringTrend: '+9% Data/Analytics roles (30d)',
    },
  },
  {
    id: 'acc_04',
    name: 'Fabrikam AI',
    domain: 'evercoremfg.com',
    industry: 'Industrial Manufacturing',
    hq: 'Phoenix, AZ',
    employeeRange: '5,001–10,000',
    tier: 'B',
    tags: ['West SMB'],
    territory: 'West SMB',
    crmStatus: 'Prospect',
    signalsSummary: {
      intentTopic: 'CPQ + forecasting',
      intentScore: 69,
      recentExecMove: 'SVP Sales left company',
      hiringTrend: '+6% Sales Ops roles (30d)',
    },
  },
  {
    id: 'acc_05',
    name: 'Globex Corp',
    domain: 'heliossec.com',
    industry: 'Cybersecurity',
    hq: 'Denver, CO',
    employeeRange: '201–500',
    tier: 'B',
    tags: ['West SMB', 'B2B SaaS'],
    territory: 'West SMB',
    crmStatus: 'Nurture',
    signalsSummary: {
      intentTopic: 'Pipeline analytics',
      intentScore: 72,
      recentExecMove: 'New CRO joined',
      hiringTrend: '+15% SDR roles (30d)',
    },
  },
  {
    id: 'acc_06',
    name: 'Initech Systems',
    domain: 'summitretail.com',
    industry: 'Retail',
    hq: 'Los Angeles, CA',
    employeeRange: '10,001+',
    tier: 'C',
    tags: ['West SMB'],
    territory: 'West SMB',
    crmStatus: 'Active Opportunity',
    signalsSummary: {
      intentTopic: 'Customer data platform',
      intentScore: 66,
      recentExecMove: 'VP Marketing Ops joined',
      hiringTrend: '+7% Ops roles (30d)',
    },
  },
  {
    id: 'acc_07',
    name: 'Hooli Inc',
    domain: 'vertexfintech.com',
    industry: 'FinTech',
    hq: 'San Jose, CA',
    employeeRange: '501–1,000',
    tier: 'A',
    tags: ['FinTech'],
    territory: 'West SMB',
    crmStatus: 'Prospect',
    signalsSummary: {
      intentTopic: 'Risk & compliance modernization',
      intentScore: 81,
      recentExecMove: 'Finance Director promoted to VP',
      hiringTrend: '+11% Compliance roles (30d)',
    },
  },
  {
    id: 'acc_08',
    name: 'Pied Piper',
    domain: 'pinnacleenergy.com',
    industry: 'Energy',
    hq: 'Houston, TX',
    employeeRange: '1,001–5,000',
    tier: 'B',
    tags: ['West SMB'],
    territory: 'West SMB',
    crmStatus: 'Prospect',
    signalsSummary: {
      intentTopic: 'Territory planning',
      intentScore: 63,
      recentExecMove: 'VP Sales Ops joined',
      hiringTrend: '+5% Sales Ops roles (30d)',
    },
  },
  {
    id: 'acc_09',
    name: 'Vandelay Industries',
    domain: 'vandelayind.com',
    industry: 'FinTech',
    hq: 'New York, NY',
    employeeRange: '200–500',
    tier: 'B',
    tags: ['West SMB'],
    territory: 'West SMB',
    crmStatus: 'Nurture',
    signalsSummary: {
      intentTopic: 'Sales forecasting',
      intentScore: 60,
      recentExecMove: 'VP Sales joined',
      hiringTrend: '+4% Sales roles (30d)',
    },
  },
  {
    id: 'acc_10',
    name: 'Stark Digital',
    domain: 'starkdigital.io',
    industry: 'MarTech',
    hq: 'Portland, OR',
    employeeRange: '100–200',
    tier: 'C',
    tags: ['West SMB'],
    territory: 'West SMB',
    crmStatus: 'Prospect',
    signalsSummary: {
      intentTopic: 'ABM platform',
      intentScore: 55,
      recentExecMove: 'VP promoted internally',
      hiringTrend: '+8% Marketing roles (30d)',
    },
  },
];

/** Lookup helper */
export function getAccount(id: string): Account | undefined {
  return seedAccounts.find((a) => a.id === id);
}
