export interface Person {
  id: string;
  fullName: string;
  title: string;
  company: string;
}

export interface Network {
  me: Person & { avatarUrl?: string };
  mutuals: Person[];
}

export const seedNetwork: Network = {
  me: {
    id: 'user_abhi',
    fullName: 'Abhi K',
    title: 'Account Executive',
    company: 'LinkedIn',
  },
  mutuals: [
    { id: 'mut_maya', fullName: 'Maya Chen', title: 'VP RevOps', company: 'Snowflake' },
    { id: 'mut_karan', fullName: 'Karan Singh', title: 'Solutions Architect', company: 'Salesforce' },
    { id: 'mut_sonia', fullName: 'Sonia Patel', title: 'Sales Leader', company: 'Okta' },
    { id: 'mut_abel', fullName: 'Abel Martinez', title: 'Finance Director', company: 'ServiceNow' },
  ],
};
