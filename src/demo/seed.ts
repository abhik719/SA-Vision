/**
 * Centralized deterministic seed data for the Plays happy-path demo.
 * All functions are pure and return the same results every time.
 */
import { seedAccounts, type Account } from '../data/accounts';
import { seedOutreachLeads, seedOutreachDrafts, defaultOutreachPlan } from '../data/outreachLeads';

// ── Territories ──────────────────────────────────────────────
export const TERRITORIES = [
  { id: 'west_smb', label: 'West SMB', isDefault: true },
  { id: 'east_enterprise', label: 'East Enterprise', isDefault: false },
  { id: 'central_mid_market', label: 'Central Mid-Market', isDefault: false },
] as const;

// ── Objectives ────────────────────────────────────────────────
export const OBJECTIVES = [
  { id: 'generate_pipeline', label: 'Generate pipeline this week', isDefault: true },
  { id: 'warm_cold_accounts', label: 'Re-engage cold accounts', isDefault: false },
  { id: 'expand_footprint', label: 'Expand footprint in existing accounts', isDefault: false },
] as const;

// ── CRM Opps (for 4 accounts) ────────────────────────────────
export const CRM_OPPS: Record<string, { stage: string; amount: string; closeDate: string }> = {
  acc_01: { stage: 'Negotiation', amount: '$120K', closeDate: '2026-03-15' },
  acc_03: { stage: 'Discovery', amount: '$85K', closeDate: '2026-04-01' },
  acc_06: { stage: 'Proposal', amount: '$200K', closeDate: '2026-03-28' },
  acc_18: { stage: 'Qualification', amount: '$310K', closeDate: '2026-05-10' },
};

// ── Signal taxonomy ──────────────────────────────────────────
export const SIGNAL_TAXONOMY = [
  { id: 'intent', label: 'Intent spikes', icon: 'TrendingUp' },
  { id: 'exec_moves', label: 'Executive changes', icon: 'UserPlus' },
  { id: 'hiring', label: 'Hiring trends', icon: 'Briefcase' },
  { id: 'engagement', label: 'Engagement signals', icon: 'Activity' },
] as const;

// ── Pure functions ───────────────────────────────────────────

/**
 * Step 1: Prioritize accounts.
 * Returns the 20 seed accounts sorted by intent score (desc), with tier/CRM data.
 */
export function runPrioritizeAccounts(territory?: string): Account[] {
  let accounts = [...seedAccounts];
  if (territory) {
    accounts = accounts.filter((a) => a.territory === territory || a.tags.includes(territory));
  }
  // Sort by intent score descending
  accounts.sort((a, b) => b.signalsSummary.intentScore - a.signalsSummary.intentScore);
  return accounts;
}

/**
 * Step 2: Find leads across the prioritized accounts.
 * Returns the 14 seed outreach leads (8 existing + 6 extended).
 */
export function runFindLeads(): typeof EXTENDED_LEADS {
  return EXTENDED_LEADS;
}

/**
 * Step 3: Build the default outreach sequence.
 * Returns the warm-connect branching plan.
 */
export function buildDefaultSequence() {
  return { ...defaultOutreachPlan };
}

/**
 * Step 4: Generate drafts for all 14 leads.
 * Returns the full draft set (existing 24 + 18 for leads 9-14 = 42 total).
 */
export function generateDrafts() {
  return [...seedOutreachDrafts, ...EXTENDED_DRAFTS];
}

/**
 * Step 5: Schedule the play.
 * Returns a schedule config.
 */
export function schedulePlay() {
  return {
    startNow: true,
    maxSendsPerDay: 20,
    businessHoursOnly: true,
    stopOnReply: true,
    scheduledAt: new Date().toISOString(),
  };
}

// ── Extended leads (9-14) to bring total to 14 ──────────────

const EXTENDED_LEADS = [
  ...seedOutreachLeads,
  {
    id: 'lead_09',
    fullName: 'Alex Thompson',
    title: 'VP Revenue Operations',
    company: { id: 'acct_novatech', name: 'NovaTech Solutions' },
    location: 'Chicago, IL',
    connectionDegree: '2nd',
    reasonForNow: [
      'New CRO joined from Salesforce — likely RevOps overhaul',
      'Intent spike: revenue operations platform (+85)',
    ],
    signals: ['EXEC_MOVE', 'INTENT_TOPIC_SPIKE'],
    email: 'alex.thompson@novatech.com',
    warmPath: { type: 'mutual', name: 'Priya Sharma', degree: '1st' },
  },
  {
    id: 'lead_10',
    fullName: 'Lisa Chang',
    title: 'Director of Sales Ops',
    company: { id: 'acct_brightpath', name: 'BrightPath Analytics' },
    location: 'Boston, MA',
    connectionDegree: '2nd',
    reasonForNow: [
      'VP Sales Operations hired — team expansion signal',
      'Active on product comparison pages',
    ],
    signals: ['HIRING_SALES', 'ENGAGEMENT'],
    email: 'lisa.chang@brightpath.ai',
    warmPath: null,
  },
  {
    id: 'lead_11',
    fullName: 'Kevin Patel',
    title: 'Head of Sales Enablement',
    company: { id: 'acct_cascade', name: 'Cascade Systems' },
    location: 'Seattle, WA',
    connectionDegree: '3rd',
    reasonForNow: [
      'Pipeline analytics intent spike (+82)',
      'Head of Sales Enablement joined — enablement investment',
    ],
    signals: ['INTENT_TOPIC_SPIKE', 'EXEC_MOVE'],
    email: 'kevin.patel@cascadesys.io',
    warmPath: { type: 'mutual', name: 'James Park', degree: '2nd' },
  },
  {
    id: 'lead_12',
    fullName: 'Natalie Brooks',
    title: 'VP Sales',
    company: { id: 'acct_apex', name: 'Apex Ventures' },
    location: 'New York, NY',
    connectionDegree: '2nd',
    reasonForNow: [
      'Series C announced ($65M) — scaling GTM',
      'Hiring 20% more GTM roles',
    ],
    signals: ['FUNDING', 'HIRING_SALES'],
    email: 'natalie.brooks@apexventures.io',
    warmPath: { type: 'mutual', name: 'Tom Baker', degree: '1st' },
  },
  {
    id: 'lead_13',
    fullName: 'Ryan Chen',
    title: 'VP IT',
    company: { id: 'acct_meridian', name: 'Meridian Group' },
    location: 'Atlanta, GA',
    connectionDegree: '3rd',
    reasonForNow: [
      'CRM consolidation initiative — VP IT from Oracle',
      'IT team expansion (+6% roles)',
    ],
    signals: ['EXEC_MOVE', 'HIRING_REVOPS'],
    email: 'ryan.chen@meridiangrp.com',
    warmPath: null,
  },
  {
    id: 'lead_14',
    fullName: 'Maria Santos',
    title: 'CFO',
    company: { id: 'acct_velocity', name: 'Velocity Labs' },
    location: 'Austin, TX',
    connectionDegree: '2nd',
    reasonForNow: [
      'First VP Sales hired — building GTM infrastructure',
      'GTM tooling intent spike (+73)',
    ],
    signals: ['HIRING_SALES', 'INTENT_TOPIC_SPIKE'],
    email: 'maria.santos@velocitylabs.dev',
    warmPath: { type: 'mutual', name: 'Marcus Rivera', degree: '1st' },
  },
];

// ── Extended drafts for leads 9-14 (3 steps each = 18 drafts) ──

import type { OutreachDraft } from '../types/outreach';

const EXTENDED_DRAFTS: OutreachDraft[] = [
  // Lead 09 — Alex Thompson
  {
    id: 'odraft_25', leadId: 'lead_09', stepId: 'step_01', status: 'NEEDS_REVIEW', subject: null,
    body: "Alex — with the new CRO at NovaTech coming from Salesforce, I'm guessing RevOps is front and center. We help revenue operations leaders unify data and cut ramp time. Open to connecting?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_26', leadId: 'lead_09', stepId: 'step_02', status: 'NEEDS_REVIEW', subject: null,
    body: "Thanks for connecting, Alex! With the CRO transition, I imagine RevOps data consolidation is a priority. We have a playbook for that exact scenario. Interested?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_27', leadId: 'lead_09', stepId: 'step_03', status: 'NEEDS_REVIEW',
    subject: "RevOps transformation at NovaTech",
    body: "Hi Alex,\n\nWith the new CRO driving a RevOps overhaul at NovaTech, the timing felt right to reach out.\n\nWe've helped VP Revenue Operations leaders at similar-stage companies consolidate pipeline data and cut reporting cycles by 50%.\n\nWorth a 10-minute chat?\n\nBest,\n[Your name]",
    lastEditedAt: null,
  },
  // Lead 10 — Lisa Chang
  {
    id: 'odraft_28', leadId: 'lead_10', stepId: 'step_01', status: 'NEEDS_REVIEW', subject: null,
    body: "Lisa — saw you've been comparing sales intelligence tools. As Director of Sales Ops at BrightPath, you're probably looking for a single source of truth. We specialize in that. Let's connect?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_29', leadId: 'lead_10', stepId: 'step_02', status: 'NEEDS_REVIEW', subject: null,
    body: "Thanks for connecting, Lisa! With BrightPath's Sales Ops expansion, I'd love to share how other Directors of Sales Ops have streamlined their tech stack. Worth a quick chat?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_30', leadId: 'lead_10', stepId: 'step_03', status: 'NEEDS_REVIEW',
    subject: "Sales Ops tooling for BrightPath",
    body: "Hi Lisa,\n\nI noticed you've been active on sales intelligence comparison pages — makes sense with the VP Sales Ops hire and team expansion at BrightPath.\n\nWe've helped Directors of Sales Ops consolidate their tech stack and get better data to their reps. One team reduced tool sprawl from 7 to 3 platforms.\n\nWorth a quick call?\n\nBest,\n[Your name]",
    lastEditedAt: null,
  },
  // Lead 11 — Kevin Patel
  {
    id: 'odraft_31', leadId: 'lead_11', stepId: 'step_01', status: 'NEEDS_REVIEW', subject: null,
    body: "Kevin — as Head of Sales Enablement at Cascade Systems, you're probably looking to level up pipeline analytics. We help enablement leaders make reps more effective with account intelligence. Open to connecting?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_32', leadId: 'lead_11', stepId: 'step_02', status: 'NEEDS_REVIEW', subject: null,
    body: "Thanks for connecting, Kevin! With Cascade's focus on pipeline analytics, I thought you'd find our enablement benchmarks useful. Want me to send them over?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_33', leadId: 'lead_11', stepId: 'step_03', status: 'NEEDS_REVIEW',
    subject: "Enablement + pipeline analytics at Cascade",
    body: "Hi Kevin,\n\nWith Cascade Systems' intent spike on pipeline analytics and your new role as Head of Sales Enablement, the timing felt right.\n\nWe've helped enablement leaders turn pipeline data into rep coaching actions. One team improved win rates by 18%.\n\nWorth a 15-minute conversation?\n\nBest,\n[Your name]",
    lastEditedAt: null,
  },
  // Lead 12 — Natalie Brooks
  {
    id: 'odraft_34', leadId: 'lead_12', stepId: 'step_01', status: 'NEEDS_REVIEW', subject: null,
    body: "Natalie — congrats on the Series C! As VP Sales at Apex Ventures, scaling GTM is probably top priority. We help post-C companies build repeatable pipeline. Open to connecting?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_35', leadId: 'lead_12', stepId: 'step_02', status: 'NEEDS_REVIEW', subject: null,
    body: "Thanks for the connect, Natalie! With Apex scaling GTM post-Series C, I imagine pipeline predictability is key. We have a framework for VPs of Sales at your stage. Interested?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_36', leadId: 'lead_12', stepId: 'step_03', status: 'NEEDS_REVIEW',
    subject: "Scaling GTM at Apex Ventures",
    body: "Hi Natalie,\n\nCongrats on Apex's $65M Series C — incredible milestone.\n\nAs you scale the GTM team, getting pipeline infrastructure right early is critical. We've helped VP Sales leaders at post-C companies build repeatable, data-driven pipeline in weeks.\n\nWorth a chat?\n\nBest,\n[Your name]",
    lastEditedAt: null,
  },
  // Lead 13 — Ryan Chen
  {
    id: 'odraft_37', leadId: 'lead_13', stepId: 'step_01', status: 'NEEDS_REVIEW', subject: null,
    body: "Ryan — heard about the CRM consolidation initiative at Meridian. Coming from Oracle, you know what scalable CRM infrastructure looks like. We help IT leaders make that transition seamless. Let's connect?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_38', leadId: 'lead_13', stepId: 'step_02', status: 'NEEDS_REVIEW', subject: null,
    body: "Thanks for connecting, Ryan! With the CRM consolidation underway at Meridian, I'd love to share how other VP IT leaders have managed the migration. Worth a quick call?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_39', leadId: 'lead_13', stepId: 'step_03', status: 'NEEDS_REVIEW',
    subject: "CRM consolidation at Meridian Group",
    body: "Hi Ryan,\n\nWith Meridian's CRM consolidation initiative and your background at Oracle, the timing felt right to reach out.\n\nWe've helped VP IT leaders at $5K+ employee companies consolidate CRM platforms while maintaining data integrity. One team cut migration time by 60%.\n\nWorth a 10-minute chat?\n\nBest,\n[Your name]",
    lastEditedAt: null,
  },
  // Lead 14 — Maria Santos
  {
    id: 'odraft_40', leadId: 'lead_14', stepId: 'step_01', status: 'NEEDS_REVIEW', subject: null,
    body: "Maria — with Velocity Labs hiring its first VP Sales, you're clearly building GTM from scratch. We help CFOs at early-stage companies get pipeline visibility from day one. Open to connecting?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_41', leadId: 'lead_14', stepId: 'step_02', status: 'NEEDS_REVIEW', subject: null,
    body: "Thanks for connecting, Maria! As Velocity Labs builds out GTM, getting financial forecasting right is critical. We've helped CFOs at your stage. Interested in a quick chat?",
    lastEditedAt: null,
  },
  {
    id: 'odraft_42', leadId: 'lead_14', stepId: 'step_03', status: 'NEEDS_REVIEW',
    subject: "GTM infrastructure for Velocity Labs",
    body: "Hi Maria,\n\nWith Velocity Labs hiring its first VP Sales and the GTM tooling intent spike, I imagine you're building the finance-GTM bridge from scratch.\n\nWe've helped CFOs at early-stage DevTools companies get pipeline visibility and forecast accuracy from day one — without heavy infrastructure.\n\nWorth a brief call?\n\nBest,\n[Your name]",
    lastEditedAt: null,
  },
];
