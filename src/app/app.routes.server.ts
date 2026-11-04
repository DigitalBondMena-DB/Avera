import { RenderMode, type ServerRoute } from '@angular/ssr';

/** Public marketing pages are server-rendered per request (settings and drafts come from the API). */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Server }];
