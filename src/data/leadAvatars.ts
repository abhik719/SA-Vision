import avatarJenna from '../assets/avatar_jenna.png';
import avatarMiguel from '../assets/avatar_miguel.png';
import avatarPriya from '../assets/avatar_priya.png';
import avatarAlicia from '../assets/avatar_alicia.png';
import avatarSamir from '../assets/avatar_samir.png';
import avatarLauren from '../assets/avatar_lauren.png';

/**
 * Map lead IDs to imported avatar images.
 * Female avatars: jenna, priya, alicia, lauren
 * Male avatars: miguel, samir
 */
export const LEAD_AVATARS: Record<string, string> = {
  // Named IDs (used in signal cards)
  ld_jenna: avatarJenna,      // Jenna Park (F)
  ld_miguel: avatarMiguel,    // Miguel Santos (M)
  ld_priya: avatarPriya,      // Priya Nair (F)
  ld_alicia: avatarAlicia,    // Alicia Chen (F)
  ld_samir: avatarSamir,      // Samir Iqbal (M)
  ld_lauren: avatarLauren,    // Lauren Wu (F)

  // Numbered IDs — gender-matched
  ld_901: avatarLauren,       // Sarah Chen (F)
  ld_902: avatarMiguel,       // Marcus Rivera (M)
  ld_903: avatarJenna,        // Emily Watson (F)
  ld_904: avatarSamir,        // James Park (M)
  ld_905: avatarPriya,        // Priya Sharma (F)
  ld_906: avatarMiguel,       // David Kim (M)
  ld_907: avatarAlicia,       // Rachel Foster (F)
  ld_908: avatarSamir,        // Tom Baker (M)
  ld_909: avatarLauren,       // Lisa Chang (F)
  ld_910: avatarMiguel,       // Alex Thompson (M)
  ld_911: avatarPriya,        // Nina Patel (F)
  ld_912: avatarSamir,        // Kevin O'Brien (M)
  ld_913: avatarJenna,        // Maria Gonzalez (F)
  ld_914: avatarMiguel,       // Robert Lee (M)
  ld_915: avatarAlicia,       // Samantha Wright (F)
  ld_916: avatarSamir,        // Chris Taylor (M)
  ld_917: avatarLauren,       // Amanda Chen (F)
  ld_918: avatarMiguel,       // Brian Moore (M)
};

/** Helper to resolve an avatar URL for a given lead ID */
export function getLeadAvatar(leadId: string): string | undefined {
  return LEAD_AVATARS[leadId];
}
