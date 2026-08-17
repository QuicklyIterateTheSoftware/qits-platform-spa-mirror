import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideQitsNavigationLinks } from '@qits/ui-components';
import { routes } from '../app.routes';

describe('RepositoryPage', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideLocationMocks(), provideHttpClient(), provideHttpClientTesting(), provideQitsNavigationLinks([])] });
    http = TestBed.inject(HttpTestingController);
  });

  async function settle(): Promise<void> {
    for (let round = 0; round < 6; round += 1) {
      await Promise.resolve();
      await harness.fixture.whenStable();
    }
  }

  it('drills into a repository and shows its cached versions', async () => {
    harness = await RouterTestingHarness.create('/repositories/npmjs');
    http.expectOne('/mirror/api/repositories/npmjs/packages').flush({
      repository: { name: 'npmjs', type: 'npm-proxy', upstream: 'https://registry.npmjs.org' },
      packages: [{ name: '@angular/core', sizeBytes: 42000, lastAccessedAt: null, versions: [{ version: '21.2.0', labels: ['latest'], files: [], sizeBytes: 42000, cachedAt: '2026-08-17T10:00:00Z', lastAccessedAt: null }] }],
    });
    await settle();
    const text = harness.fixture.nativeElement.textContent as string;
    expect(text).toContain('@angular/core');
    expect(text).toContain('21.2.0');
    expect(text).toContain('latest');
    expect(text).toContain('Never');
  });

  it('keeps a failed detail read distinct from an empty cache', async () => {
    harness = await RouterTestingHarness.create('/repositories/npmjs');
    http.expectOne('/mirror/api/repositories/npmjs/packages').flush({}, { status: 503, statusText: 'Unavailable' });
    await settle();
    const element = harness.fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Could not load cached packages');
    expect(element.querySelector('.browser')).toBeNull();
  });
});
