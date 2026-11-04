import type { ISettings } from '@core/models/api.model';

/**
 * Safe fallback used only when the API cannot be reached during render.
 * Mirrors the source contact details; every unconfirmed claim stays off and forms report "not sent".
 */
export const DEFAULT_SETTINGS: ISettings = {
  business: {
    name: { en: 'AVERA Elite Business Solutions', ar: 'أفيرا إيليت لحلول الأعمال' },
    email: 'info@averaelite.com',
    careersEmail: 'info@averaelite.com',
    phones: [
      { id: 'eg-1', region: 'EG', display: '+20 127 320 2558' },
      { id: 'eg-2', region: 'EG', display: '+20 122 863 0002' },
      { id: 'ksa', region: 'SA', display: '+966 56 906 5465' },
    ],
    whatsapp: null,
    address: { confirmed: false, en: null, ar: null, cityEn: 'Cairo, Egypt', cityAr: 'القاهرة، مصر' },
    registration: { commercialRegister: null, taxCard: null, socialInsuranceFile: null },
    responseSlaConfirmed: false,
    linkedinUrl: null,
  },
  confirmations: { ipAssignmentAndNda: false, encryptedArchive: false, packageInclusions: false },
  publication: {
    showDrafts: false,
    routes: { '/about/leadership': 'draft', '/about/clients': 'draft', '/insights': 'draft', '/guides/hiring-in-egypt': 'draft', '/thank-you': 'utility' },
  },
  integrations: { bookingUrl: null, ga4Id: null, linkedinPartnerId: null, leadsLive: false },
};
