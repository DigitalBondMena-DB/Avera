export type Locale = 'en' | 'ar';

export type ServiceSlug =
  | 'employer-of-record'
  | 'payroll'
  | 'social-insurance'
  | 'health-life'
  | 'talent-acquisition'
  | 'legal-labor-relations'
  | 'training'
  | 'workspace'
  | 'events';

export type ServiceGroup = 'employ' | 'talent' | 'workplace';
export type MarketSlug = 'saudi-arabia' | 'uae' | 'qatar' | 'kuwait' | 'international';
export type ImageKey =
  | 'leadership-meeting-hero'
  | 'team-collaboration'
  | 'recruitment-consultation'
  | 'payroll-advisory'
  | 'workspace-editorial'
  | 'architecture-hero';

/** A business statement that may only be published once a config confirmation is set. */
export type Confirmation = 'ipAssignmentAndNda' | 'encryptedArchive' | 'packageInclusions';

export interface IPageMeta { title: string; description: string }
export interface IItem { title: string; text?: string; requires?: Confirmation }
export interface IFaq { q: string; a: string; requires?: Confirmation }
export interface IOption { value: string; label: string }
export interface IImg { key: ImageKey; alt: string; position?: string }

export interface IServiceContent {
  slug: ServiceSlug;
  group: ServiceGroup;
  name: string;
  short: string;
  meta: IPageMeta;
  h1: string;
  promise: string;
  image?: IImg;
  includedTitle: string;
  included: IItem[];
  deliverablesTitle?: string;
  deliverables?: string[];
  process?: { title: string; intro?: string; steps: IItem[] };
  comparison?: { title: string; intro: string; columns: [string, string, string]; rows: [string, string, string][] };
  faq: IFaq[];
  related: ServiceSlug[];
  cta: { title: string; text: string };
}

export interface IMarketContent {
  slug: MarketSlug;
  countryValue: string;
  name: string;
  linkLabel: string;
  meta: IPageMeta;
  eyebrow: string;
  h1: string;
  intro: string;
  facts: IItem[];
  scopeTitle: string;
  scope: string[];
  reasonsTitle?: string;
  reasons?: IItem[];
  path?: { title: string; steps: IItem[] };
  contactTitle: string;
  contactText: string;
  phoneIds: string[];
  cta: { title: string; text: string };
}

export interface IDictionary {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  langName: string;
  otherLangName: string;
  siteName: string;
  tagline: string;

  common: {
    getProposal: string;
    bookConsultation: string;
    sendRequest: string;
    learnMore: string;
    allServices: string;
    skipToContent: string;
    menu: string;
    closeMenu: string;
    close: string;
    home: string;
    breadcrumb: string;
    switchLanguage: string;
    illustrative: string;
    draftBanner: string;
    draftLabel: string;
    relatedServices: string;
    faqTitle: string;
    onThisPage: string;
    call: string;
    whatsapp: string;
    whatsappText: string;
    email: string;
    egypt: string;
    ksa: string;
    office: string;
    directLines: string;
    notSure: string;
    notSureText: string;
    responseNeutral: string;
    responseSla: string;
    generalInfo: string;
  };

  nav: {
    utilityAudience: string;
    trust: string;
    careers: string;
    services: string;
    markets: string;
    industries: string;
    pricing: string;
    about: string;
    aboutAvera: string;
    insights: string;
    howItWorks: string;
    whyEgypt: string;
    faq: string;
    contact: string;
    leadership: string;
    clients: string;
    groups: Record<ServiceGroup, string>;
    gulfCompanies: string;
    internationalCompanies: string;
    internationalNote: string;
    mainNav: string;
    footerNav: string;
  };

  footer: {
    line: string;
    servicesTitle: string;
    companyTitle: string;
    contactTitle: string;
    legalTitle: string;
    privacy: string;
    terms: string;
    cookies: string;
    cookieSettings: string;
    sitemap: string;
    rights: string;
    illustrativeNote: string;
  };

  home: {
    meta: IPageMeta;
    eyebrow: string;
    h1: string;
    lead: string;
    heroImageAlt: string;
    entries: { eyebrow: string; title: string; text: string; link: string }[];
    guideEntry: { eyebrow: string; title: string; text: string; link: string };
    servicesEyebrow: string;
    servicesTitle: string;
    servicesText: string;
    proofTitle: string;
    proofFacts: { value: string; text: string }[];
    processTitle: string;
    processSteps: IItem[];
    processLink: string;
    marketsEyebrow: string;
    marketsTitle: string;
    marketsText: string;
    marketsImageAlt: string;
    trustEyebrow: string;
    trustTitle: string;
    trustText: string;
    trustImageAlt: string;
    trustItems: IItem[];
    trustFactsTitle: string;
    trustFactsText: string;
    trustDocs: string;
    trustLink: string;
    finalTitle: string;
    finalText: string;
  };

  servicesHub: { meta: IPageMeta; h1: string; intro: string; groupIntro: Record<ServiceGroup, string> };
  services: Record<ServiceSlug, IServiceContent>;
  serviceUi: {
    included: string;
    deliverables: string;
    startTitle: string;
    startSteps: IItem[];
    startLink: string;
  };

  marketsHub: {
    meta: IPageMeta;
    eyebrow: string;
    h1: string;
    intro: string;
    imageAlt: string;
    advantagesTitle: string;
    advantages: IItem[];
    selectorTitle: string;
    whyEgyptText: string;
    ctaTitle: string;
    ctaText: string;
  };
  markets: Record<MarketSlug, IMarketContent>;
  marketUi: { factsTitle: string; otherMarkets: string };

  whyEgypt: { meta: IPageMeta; eyebrow: string; h1: string; intro: string; blocks: IItem[]; note: string; ctaTitle: string; ctaText: string };
  howItWorks: { meta: IPageMeta; h1: string; intro: string; steps: IItem[]; note: string; ctaTitle: string; ctaText: string };
  industries: { meta: IPageMeta; h1: string; intro: string; sectors: { id: string; name: string; roles: string }[]; rolesLabel: string; sectorCta: string; ctaTitle: string; ctaText: string };

  pricing: {
    meta: IPageMeta;
    h1: string;
    intro: string;
    modelTitle: string;
    modelItems: IItem[];
    packagesTitle: string;
    packagesIntro: string;
    packages: { name: string; bestFor: string }[];
    bestForLabel: string;
    coreTitle: string;
    coreText: string;
    comparisonTitle: string;
    comparisonRows: { label: string; values: [string, string, string] }[];
    bundlesTitle: string;
    bundles: IItem[];
    ctaTitle: string;
    ctaText: string;
  };

  faqPage: { meta: IPageMeta; h1: string; intro: string; groups: { title: string; items: IFaq[] }[]; ctaTitle: string; ctaText: string };

  trust: {
    meta: IPageMeta;
    eyebrow: string;
    h1: string;
    intro: string;
    factsTitle: string;
    factsCompany: string;
    factsCr: string;
    factsTax: string;
    factsInsurance: string;
    factsOnRequest: string;
    docsButton: string;
    commitmentsTitle: string;
    commitmentsIntro: string;
    commitments: IItem[];
    questionsTitle: string;
    questionsIntro: string;
    questions: IItem[];
    lawsTitle: string;
    lawsIntro: string;
    laws: IItem[];
    disclaimer: string;
    imageAlt: string;
  };

  guide: {
    meta: IPageMeta;
    h1: string;
    summaryTitle: string;
    summary: string;
    reviewNote: string;
    chapters: IItem[];
    chapterCta: string;
    disclaimer: string;
  };

  about: {
    meta: IPageMeta;
    eyebrow: string;
    h1: string;
    intro: string;
    imageAlt: string;
    storyTitle: string;
    story: string;
    visionTitle: string;
    vision: string;
    missionTitle: string;
    mission: string;
    valuesTitle: string;
    values: IItem[];
    whyTitle: string;
    why: IItem[];
    linksTitle: string;
    ctaTitle: string;
    ctaText: string;
    talk: string;
  };
  leadership: { meta: IPageMeta; h1: string; intro: string; empty: string };
  clients: { meta: IPageMeta; h1: string; intro: string; logosTitle: string; testimonialsTitle: string; caseTitle: string; caseLabels: [string, string, string]; empty: string };
  careers: {
    meta: IPageMeta;
    h1: string;
    intro: string;
    imageAlt: string;
    tabs: [string, string];
    noOpenings: string;
    interestTitle: string;
    interestText: string;
    interestButton: string;
    clientsNote: string;
  };
  insights: { meta: IPageMeta; h1: string; intro: string; filters: string[]; planned: string; plannedTitles: string[] };

  contact: {
    meta: IPageMeta;
    h1: string;
    intro: string;
    tabs: [string, string];
    bookingText: string;
    bookingButton: string;
    officeNote: string;
  };
  thankYou: { meta: IPageMeta; h1: string; text: string; noAck: string; next: string; links: { label: string; href: string }[] };

  legal: {
    privacy: { meta: IPageMeta; h1: string; updatedNote: string; sections: IItem[] };
    terms: { meta: IPageMeta; h1: string; updatedNote: string; sections: IItem[] };
    cookies: { meta: IPageMeta; h1: string; intro: string; essentialTitle: string; essential: IItem[]; optionalTitle: string; optionalNone: string; optionalConfigured: string; manage: string };
  };
  sitemapPage: { meta: IPageMeta; h1: string; groups: { company: string; services: string; markets: string; resources: string; legal: string } };
  notFound: { meta: IPageMeta; h1: string; text: string; home: string; services: string; contact: string };

  forms: {
    stepLabel: string; // "Step {n} of {total}"
    stepNames: [string, string, string];
    required: string;
    optional: string;
    next: string;
    back: string;
    submit: string;
    submitting: string;
    errorSummary: string;
    errors: { required: string; email: string; services: string; tooLong: string; generic: string; network: string; rateLimited: string };
    freeEmailHint: string;
    privacy: string; // contains {privacy}
    privacyLink: string;
    previewTitle: string;
    previewText: string;
    previewBanner: string;
    testBanner: string;
    retry: string;
    fields: {
      employees: string;
      roles: string;
      rolesHint: string;
      start: string;
      services: string;
      servicesHint: string;
      message: string;
      name: string;
      email: string;
      company: string;
      country: string;
      countryPlaceholder: string;
      phone: string;
      phoneHint: string;
      availability: string;
      availabilityHint: string;
      topic: string;
      documents: string;
      documentsHint: string;
    };
    employeesOptions: IOption[];
    startOptions: IOption[];
    serviceOptions: IOption[];
    countries: IOption[];
    proposal: { title: string; intro: string };
    consultation: { title: string; intro: string };
    documents: { title: string; intro: string };
  };

  consent: { title: string; text: string; accept: string; reject: string; policy: string };
}
