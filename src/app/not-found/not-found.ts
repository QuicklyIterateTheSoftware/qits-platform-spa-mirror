import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * A URL under `/mirror/` that this app does not recognise.
 *
 * It renders a small page and stops there. It deliberately does **not** copy spa-home's behaviour
 * of handing the URL back to the gateway: that is the landing page's job, and it is correct only
 * because spa-home is mounted at the root, where an unknown first segment is another micro
 * frontend. Here the segment is already ours, so there is nobody to hand it to.
 *
 * One caveat for whoever lands here from a registry client's address: the wire protocols this
 * service speaks are **not** under `/mirror/`. npm and maven answer at `/artifacts/npm` and
 * `/artifacts/maven`, and OCI at the host root — this segment carries the explorer and the admin
 * API, and nothing a client pulls through.
 */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <h1>No such page here</h1>
    <p>
      This is the mirror explorer. It has a list of cached repositories and a list of mirrored OCI
      registries — and nothing else.
    </p>
    <p><a routerLink="/">Back to the cached repositories</a></p>
  `,
  styles: `
    h1 {
      font-size: 1.25rem;
      margin: 0 0 0.5rem;
    }
  `,
})
export class NotFound {}
