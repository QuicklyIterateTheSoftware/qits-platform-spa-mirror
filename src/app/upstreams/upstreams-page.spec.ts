import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideQitsNavigationLinks } from '@qits/ui-components';
import { routes } from '../app.routes';
import type { OciUpstreamDto } from '../api/dto';

/**
 * The mirrored registries, one state at a time. The same two honesty rules as the repositories
 * page: a failed read is a failure on screen, and a field nobody promised is still drawn.
 *
 * The empty case matters more here than anywhere else in this app. An OCI mirror with no upstream
 * row serves nothing at all, so "no registry is mirrored" is a finding rather than a quiet state,
 * and it must never share a rendering with a read that fell over.
 */
describe('UpstreamsPage', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideQitsNavigationLinks([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  async function open(): Promise<void> {
    harness = await RouterTestingHarness.create('/upstreams');
  }

  function page(): HTMLElement {
    return harness.fixture.nativeElement as HTMLElement;
  }

  function text(): string {
    return page().textContent ?? '';
  }

  async function settle(): Promise<void> {
    for (let round = 0; round < 6; round += 1) {
      await Promise.resolve();
      await harness.fixture.whenStable();
    }
  }

  function flush(rows: readonly OciUpstreamDto[]): void {
    http.expectOne('/mirror/api/upstreams').flush({ upstreams: rows });
  }

  it('draws a row per mirrored registry, from one request', async () => {
    await open();
    flush([{ host: 'docker.io' }, { host: 'ghcr.io' }, { host: 'quay.io' }]);
    await settle();

    http.verify();
    expect(page().querySelectorAll('tbody tr')).toHaveLength(3);
    expect(text()).toContain('docker.io');
    expect(text()).toContain('quay.io');
  });

  it('gives a field the contract never promised a column of its own', async () => {
    await open();
    flush([{ host: 'docker.io', endpoint: 'https://registry-1.docker.io', enabled: true }]);
    await settle();

    const headers = [...page().querySelectorAll('thead th')].map((cell) =>
      cell.textContent?.trim(),
    );
    expect(headers).toEqual(['Host', 'Endpoint', 'Enabled']);
    expect(text()).toContain('https://registry-1.docker.io');
    expect(text()).toContain('yes');
  });

  it('says a failed read failed, and draws no table at all', async () => {
    await open();
    http
      .expectOne('/mirror/api/upstreams')
      .flush({ message: 'no' }, { status: 500, statusText: 'Server Error' });
    await settle();

    expect(text()).toContain('Could not load the OCI upstreams');
    expect(page().querySelector('table')).toBeNull();
  });

  it('says an empty table is empty, and what that costs', async () => {
    await open();
    flush([]);
    await settle();

    expect(text()).toContain('No registry is mirrored');
  });
});
