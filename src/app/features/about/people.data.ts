/**
 * Approved, real people and client evidence only. Leave empty until supplied and approved.
 * Never use generated or stock photography for anyone listed here.
 */
type T = { en: string; ar: string };

export interface ILeader { id: string; name: T; title: T; bio: T; portrait?: string; linkedin?: string }
export interface IClientLogo { id: string; name: string; file: string; width: number; height: number; approvedOn: string }
export interface ITestimonial { id: string; quote: T; person: string; role: T; company: string; approvedOn: string }
export interface ICaseStudy { id: string; client: string; challenge: T; action: T; result: T; approvedOn: string }

export const LEADERS: ILeader[] = [];
export const CLIENT_LOGOS: IClientLogo[] = [];
export const TESTIMONIALS: ITestimonial[] = [];
export const CASE_STUDIES: ICaseStudy[] = [];
