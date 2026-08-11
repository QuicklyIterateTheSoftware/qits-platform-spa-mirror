import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideQitsNavigationLinks } from '@qits/ui-components';
import { routes } from '../app.routes';
import type { MirrorRepositoryDto } from '../api/dto';

/**
 * The cached repositories, one state at a time.
 *
 * Two assertions here are about honesty rather than rendering, and they are the ones worth keeping
 * if the rest are ever trimmed: **a failed read is drawn as a failure, never as an empty mirror**,
 * and **a field the contract never promised is drawn rather than dropped**. The first is the lie an
 * operator would act on; the second is what lets the service ship a field without this repository
 * releasing.
 */
describe('RepositoriesPage', () => {
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
    harness = await RouterTestingHarness.create('/');
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

  function flush(rows: readonly MirrorRepositoryDto[]): void {
    http.expectOne('/mirror/api/repositories').flush({ repositories: rows });
  }

  it('reads exactly one request, whatever the mirror holds', async () => {
    await open();
    flush([
      { name: 'npmjs', type: 'npm-proxy' },
      { name: 'maven', type: 'maven-proxy' },
      { name: 'docker.io', type: 'oci-mirror' },
    ]);
    await settle();

    http.verify();
    expect(page().querySelectorAll('tbody tr')).toHaveLength(3);
  });

  it('draws the name and the type of every row', async () => {
    await open();
    flush([{ name: 'npmjs', type: 'npm-proxy' }]);
    await settle();

    expect(text()).toContain('npmjs');
    expect(text()).toContain('npm-proxy');
  });

  it('gives a field the contract never promised a column of its own', async () => {
    await open();
    flush([
      { name: 'npmjs', type: 'npm-proxy', itemCount: 710, lastHitAt: '2026-08-11T09:00:00Z' },
    ]);
    await settle();

    const headers = [...page().querySelectorAll('thead th')].map((cell) =>
      cell.textContent?.trim(),
    );
    expect(headers).toEqual(['Repository', 'Type', 'Item count', 'Last hit at']);
    expect(text()).toContain('710');
  });

  it('says a failed read failed, and draws no table at all', async () => {
    await open();
    http
      .expectOne('/mirror/api/repositories')
      .flush(
        { message: 'the database is unreachable' },
        { status: 503, statusText: 'Unavailable' },
      );
    await settle();

    expect(text()).toContain('Could not load the cached repositories');
    expect(text()).toContain('503');
    expect(page().querySelector('table')).toBeNull();
  });

  it('says an unreachable service is unreachable rather than printing a status that does not exist', async () => {
    await open();
    http
      .expectOne('/mirror/api/repositories')
      .error(new ProgressEvent('error'), { status: 0, statusText: '' });
    await settle();

    expect(text()).toContain('the service is unreachable');
    expect(page().querySelector('table')).toBeNull();
  });

  it('says an empty mirror is empty, in a sentence rather than as blank space', async () => {
    await open();
    flush([]);
    await settle();

    expect(text()).toContain('This mirror has cached nothing yet');
  });

  it('re-reads on retry after a failure', async () => {
    await open();
    http
      .expectOne('/mirror/api/repositories')
      .flush({ message: 'nope' }, { status: 503, statusText: 'Unavailable' });
    await settle();

    page().querySelector<HTMLButtonElement>('.async-error button')?.click();
    await settle();

    flush([{ name: 'npmjs', type: 'npm-proxy' }]);
    await settle();

    expect(text()).toContain('npmjs');
    expect(text()).not.toContain('Could not load the cached repositories');
  });
});
