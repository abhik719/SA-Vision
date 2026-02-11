import type { ApprovalItem } from '../types/evidence';

export const seedDrafts: ApprovalItem[] = [
  {
    draftId: 'dr_01',
    leadId: 'ld_901',
    leadName: 'Sarah Chen',
    accountName: 'Acme Software',
    status: 'PENDING',
    signals: ['VP Sales hire', 'RevOps hiring spike'],
    message:
      "Sarah — noticed the VP Sales move and RevOps hiring spike at Acme. We're helping teams modernize CRM workflows without disrupting reps. Open to a 10-min swap on what you're optimizing this quarter?",
  },
  {
    draftId: 'dr_02',
    leadId: 'ld_902',
    leadName: 'Marcus Rivera',
    accountName: 'Acme Software',
    status: 'PENDING',
    signals: ['Quarterly earnings call', 'Budget expansion'],
    message:
      "Marcus — with Q1 budget conversations underway, wanted to share how other CFOs are getting pipeline visibility without adding headcount. Worth 15 minutes?",
  },
  {
    draftId: 'dr_03',
    leadId: 'ld_903',
    leadName: 'Emily Watson',
    accountName: 'Northwind Traders',
    status: 'PENDING',
    signals: ['Champion engagement up', 'Competitor migration'],
    message:
      "Emily — noticed Northwind is evaluating alternatives. Given the competitive pressures, timing matters. Happy to walk through how we help finance leaders get real-time pipeline metrics.",
  },
  {
    draftId: 'dr_04',
    leadId: 'ld_904',
    leadName: 'James Park',
    accountName: 'Contoso Cloud',
    status: 'PENDING',
    signals: ['Active in last 7d', 'Product page view'],
    message:
      "James — noticed you checked out our product page. As Head of RevOps at Contoso, you probably deal with data fragmentation. Would love to show how we consolidate that into one view.",
  },
  {
    draftId: 'dr_05',
    leadId: 'ld_905',
    leadName: 'Priya Sharma',
    accountName: 'Fabrikam AI',
    status: 'PENDING',
    signals: ['Series B funding', 'Hiring VP Sales'],
    message:
      "Congrats on the Series B, Priya! With Fabrikam scaling the sales team, you're likely thinking about infrastructure. We've helped AI companies at your stage build ops without huge headcount.",
  },
  {
    draftId: 'dr_06',
    leadId: 'ld_906',
    leadName: 'David Kim',
    accountName: 'Globex Corp',
    status: 'PENDING',
    signals: ['Product launch', 'Conference speaker'],
    message:
      "David — saw your talk at the summit. Your point about operational efficiency resonated. We're working with a few VPs on that exact challenge. Happy to compare approaches?",
  },
  {
    draftId: 'dr_07',
    leadId: 'ld_907',
    leadName: 'Rachel Foster',
    accountName: 'Initech Systems',
    status: 'PENDING',
    signals: ['New role', 'Team expansion'],
    message:
      "Rachel — congrats on the new role! As you build out the sales team, tools that drive consistency matter. We help directors get ramped fast with data-driven prospecting.",
  },
  {
    draftId: 'dr_08',
    leadId: 'ld_908',
    leadName: 'Tom Baker',
    accountName: 'Hooli Inc',
    status: 'PENDING',
    signals: ['Board meeting signal', 'Active LinkedIn'],
    message:
      "Tom — been following your posts on revenue strategy. Given Hooli's trajectory, I think there's a strong fit with our pipeline intelligence. Could I send a 2-min case study?",
  },
];

/** 6 drafts for outreach job (job_draft_outreach_6 / ev_4202) — Finance stakeholder search context */
export const seedDraftsForOutreach6: ApprovalItem[] = [
  {
    draftId: 'dr_v2_01',
    leadId: 'ld_901',
    leadName: 'Sarah Chen',
    accountName: 'Acme Software',
    status: 'PENDING',
    signals: ['VP Sales hire', 'RevOps hiring spike'],
    message:
      "Sarah — when we mapped the buying committee at Acme, you stood out given the VP Sales move and RevOps expansion. We help finance-adjacent teams get pipeline visibility without adding headcount. Worth 10 minutes to compare notes?",
  },
  {
    draftId: 'dr_v2_02',
    leadId: 'ld_902',
    leadName: 'Marcus Rivera',
    accountName: 'Acme Software',
    status: 'PENDING',
    signals: ['Quarterly earnings call', 'Budget expansion'],
    message:
      "Marcus — as Acme's CFO during Q1 budget season, pipeline visibility is probably top of mind. We've helped other finance leaders get real-time metrics without adding headcount. Open to a 15-min swap?",
  },
  {
    draftId: 'dr_v2_03',
    leadId: 'ld_903',
    leadName: 'Emily Watson',
    accountName: 'Northwind Traders',
    status: 'PENDING',
    signals: ['Champion engagement up', 'Competitor migration'],
    message:
      "Emily — from our finance persona search at Northwind, you're clearly in the evaluation. Given the competitive pressures, we can help get real-time pipeline metrics in place. Happy to walk through in 15 minutes?",
  },
  {
    draftId: 'dr_v2_04',
    leadId: 'ld_904',
    leadName: 'James Park',
    accountName: 'Contoso Cloud',
    status: 'PENDING',
    signals: ['Active in last 7d', 'Product page view'],
    message:
      "James — you came up in our finance stakeholder search for Contoso. With your product page visit, you're likely thinking about data consolidation. We specialize in that—happy to show how we pull it into one view.",
  },
  {
    draftId: 'dr_v2_05',
    leadId: 'ld_905',
    leadName: 'Priya Sharma',
    accountName: 'Fabrikam AI',
    status: 'PENDING',
    signals: ['Series B funding', 'Hiring VP Sales'],
    message:
      "Priya — congrats on the Series B! As Fabrikam scales, we found you as a key finance stakeholder. We've helped AI companies at your stage build ops without huge headcount. Interested in comparing notes?",
  },
  {
    draftId: 'dr_v2_06',
    leadId: 'ld_906',
    leadName: 'David Kim',
    accountName: 'Globex Corp',
    status: 'PENDING',
    signals: ['Product launch', 'Conference speaker'],
    message:
      "David — your summit talk resonated. As a finance-adjacent VP at Globex, you're likely thinking about operational efficiency. We're working with similar leaders on that. Happy to share what's working?",
  },
];
