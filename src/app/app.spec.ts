import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideQitsNavigationLinks } from '@qits/ui-components';
import { App } from './app';
import { routes } from './app.routes';

/**
 * A fixture navigation, not the platform's. `provideQitsNavigationLinks` answers the layout's
 * `QITS_NAVIGATION` from a literal, so the chrome makes no `/main-navigation` request — which is
 * what keeps `http.verify()` honest instead of failing on a call this file never asked for.
 */
const NAV = [
  { label: 'Artifacts', href: '/artifacts/' },
  { label: 'Mirror', href: '/mirror/' },
] as const;

/**
 * The shell owns two things — the outlet, and the sub-menu it hands to the chrome — so that is what
 * is asserted here, plus the route table reaching the shared layout and the pages sitting inside
 * that layout rather than replacing it.
 *
 * What the layout renders is the ui-components library's business. The link count checked against
 * it is the fixture's, and what it proves is that this app mounts the chrome and the chrome renders
 * what it is told; the platform's real link count is a deployment fact and the gateway's own spec's
 * job.
 */
describe('App', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideQitsNavigationLinks(NAV),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('is an outlet and a sub-menu template, and nothing else', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const shell = fixture.nativeElement as HTMLElement;
    expect(shell.querySelector('router-outlet')).not.toBeNull();
    // The `<ng-template>` is an anchor comment, never an element — so one child, the outlet.
    expect(shell.children).toHaveLength(1);
  });

  it('routes the base path to the shared layout, with the repositories inside it', async () => {
    const harness = await RouterTestingHarness.create('/');
    const layout = harness.routeNativeElement as HTMLElement;

    expect(layout.tagName.toLowerCase()).toBe('qits-main-layout');
    expect(layout.querySelectorAll('nav a')).toHaveLength(NAV.length);
    expect(layout.querySelector('main app-repositories-page')).not.toBeNull();

    http.expectOne('/mirror/api/repositories').flush({ repositories: [] });
  });

  it('routes /upstreams to the upstreams page, still inside the chrome', async () => {
    const harness = await RouterTestingHarness.create('/upstreams');
    const layout = harness.routeNativeElement as HTMLElement;

    expect(layout.tagName.toLowerCase()).toBe('qits-main-layout');
    expect(layout.querySelector('main app-upstreams-page')).not.toBeNull();

    http.expectOne('/mirror/api/upstreams').flush({ upstreams: [] });
  });

  it('draws an unknown URL under /mirror/ as a page, still inside the chrome', async () => {
    const harness = await RouterTestingHarness.create('/nothing-here');
    const layout = harness.routeNativeElement as HTMLElement;

    expect(layout.tagName.toLowerCase()).toBe('qits-main-layout');
    expect(layout.querySelector('main app-not-found')).not.toBeNull();
    http.verify();
  });
});
