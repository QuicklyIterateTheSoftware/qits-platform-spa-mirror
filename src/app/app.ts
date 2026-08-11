import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QitsNavSubmenu } from '@qits/ui-components';
import { ViewNav } from './nav/view-nav';

/**
 * The shell: an outlet, and this app's own two views offered to the chrome as a sub-menu.
 *
 * Declared here, rendered somewhere else, and that is the only arrangement available.
 * `QitsMainLayout` is a route component — the pages sit inside *its* outlet and this shell is
 * outside it — so nothing can be projected upwards into the sidebar. The template is handed over
 * instead, and the layout renders it under whichever navigation entry is this application.
 *
 * **The shell rather than a page**, and that part is a correctness one. `RouterOutlet` destroys the
 * outgoing component after creating the incoming one, so a declaration inside a page is torn down
 * and rebuilt on every hop — in a menu that did not itself change. Here it is built once at
 * bootstrap and never destroyed.
 *
 * Nothing else belongs here: markup put in this template would sit above the layout, where no route
 * could replace it.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, QitsNavSubmenu, ViewNav],
  template: `
    <ng-template qitsNavSubmenu><app-view-nav /></ng-template>
    <router-outlet />
  `,
})
export class App {}
