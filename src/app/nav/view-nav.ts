import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * This application's own two doors, offered to the platform chrome as a sub-menu.
 *
 * `routerLink`, not `href`, and that is the difference between this list and the one above it in
 * the sidebar: those destinations are other Angular applications and need a full document load,
 * these two are routes of this one and must not reload the page.
 *
 * It is rendered by `QitsMainLayout` under whichever navigation entry is this application — or at
 * the foot of the navigation when the gateway serves no entry for it, which is the state a
 * developer running `ng serve` sees.
 */
@Component({
  selector: 'app-view-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <ul class="views">
      <li>
        <a
          routerLink="/"
          routerLinkActive="current"
          [routerLinkActiveOptions]="{ exact: true }"
          ariaCurrentWhenActive="page"
          >Cached repositories</a
        >
      </li>
      <li>
        <a routerLink="/upstreams" routerLinkActive="current" ariaCurrentWhenActive="page"
          >OCI upstreams</a
        >
      </li>
    </ul>
  `,
  styles: `
    .views {
      list-style: none;
      margin: 0;
      padding: 4px 8px 8px 20px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    a {
      display: block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 13px;
      color: #4b5563;
      text-decoration: none;
    }
    a:hover {
      background: #f3f4f6;
      color: #111827;
    }
    .current {
      background: #e5e7eb;
      color: #111827;
      font-weight: 600;
    }
  `,
})
export class ViewNav {}
