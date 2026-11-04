/** "+20 127 320 2558" → "tel:+201273202558" */
export const telHref = (display: string): string => `tel:${display.replace(/[^\d+]/g, '')}`;
export const waHref = (display: string, text: string): string => `https://wa.me/${display.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
export const pad2 = (n: number): string => String(n).padStart(2, '0');
