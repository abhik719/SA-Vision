import acc1 from '../assets/acc1.png';
import acc2 from '../assets/acc2.png';
import acc3 from '../assets/acc3.png';
import acc4 from '../assets/acc4.png';

/**
 * Map account IDs to imported logo images.
 * Accounts without an image will fall back to the initial-letter avatar.
 */
export const ACCOUNT_LOGOS: Record<string, string> = {
  acc_01: acc1,
  acc_02: acc2,
  acc_03: acc3,
  acc_04: acc4,
};

/** Helper to resolve a logo URL for a given account ID */
export function getAccountLogo(accountId: string): string | undefined {
  return ACCOUNT_LOGOS[accountId];
}
