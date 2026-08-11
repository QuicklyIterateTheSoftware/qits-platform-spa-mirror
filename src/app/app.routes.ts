import type { Routes } from '@angular/router';
import { QitsMainLayout } from '@qits/ui-components';
import { NotFound } from './not-found/not-found';
import { RepositoriesPage } from './repositories/repositories-page';
import { UpstreamsPage } from './upstreams/upstreams-page';

/**
 * Two pages, both inside the platform chrome.
 *
 * `QitsMainLayout` is the **root route component**, not a tag wrapped around each page — the
 * platform's convention, stated in the component's own docs. Mounted this way the bar and the
 * navigation mount once and survive every navigation beneath them; wrapping each page in a tag
 * would rebuild the whole skeleton on every hop.
 *
 * Its links leave this SPA on purpose: every destination is a different Angular application behind
 * its own base path, so they are plain `<a href>` full-document navigations. The list comes from
 * `provideQitsNavigation()` — see app.config.ts — and this client passes no links of its own. The
 * two doors *inside* this app are a sub-menu the shell hands to the layout instead; see app.ts.
 *
 * **Each view is a path segment**, so both are bookmarkable and the back button works with no code.
 * They are siblings rather than a drill-down: cached repositories and mirrored registries are two
 * different questions about the same service, and neither is inside the other.
 *
 * Both load eagerly. There are two of them, they share every component below them, and a lazy chunk
 * boundary would be ceremony that costs a round trip.
 *
 * The `**` route sits inside the layout: `/mirror/` is a segment this application owns outright, so
 * an unknown URL under it is an ordinary 404 and is drawn with the chrome around it.
 */
export const routes: Routes = [
  {
    path: '',
    component: QitsMainLayout,
    children: [
      { path: '', component: RepositoriesPage },
      { path: 'upstreams', component: UpstreamsPage },
      { path: '**', component: NotFound },
    ],
  },
];
