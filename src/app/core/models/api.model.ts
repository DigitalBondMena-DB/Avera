/** Standard Digital Bond JSON envelope. */
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface IPhone { id: string; region: string; display: string }

export interface ISettings {
  business: {
    name: { en: string; ar: string };
    email: string;
    careersEmail: string;
    phones: IPhone[];
    whatsapp: string | null;
    address: { confirmed: boolean; en: string | null; ar: string | null; cityEn: string; cityAr: string };
    registration: { commercialRegister: string | null; taxCard: string | null; socialInsuranceFile: string | null };
    responseSlaConfirmed: boolean;
    linkedinUrl: string | null;
  };
  confirmations: { ipAssignmentAndNda: boolean; encryptedArchive: boolean; packageInclusions: boolean };
  publication: { showDrafts: boolean; routes: Record<string, 'public' | 'utility' | 'draft'> };
  integrations: { bookingUrl: string | null; ga4Id: string | null; linkedinPartnerId: string | null; leadsLive: boolean };
}

export type LeadKind = 'proposal' | 'consultation' | 'documents';

export interface ILeadData {
  employees?: string;
  roles?: string;
  start?: string;
  services?: string[];
  message?: string;
  name?: string;
  email?: string;
  company?: string;
  country?: string;
  phone?: string;
  availability?: string;
  topic?: string;
  documents?: string;
}

export interface ILeadRequest { kind: LeadKind; locale: string; page: string; website: string; data: ILeadData }
export interface ILeadResponse { reference: string; kind: LeadKind; received_at: string }

export type LeadResult =
  | { status: 'ok' }
  | { status: 'preview' }
  | { status: 'invalid'; errors: Record<string, string[]> }
  | { status: 'error'; code: 'network' | 'rate_limited' | 'generic' };
