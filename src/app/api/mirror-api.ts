import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { QITS_API_BASE } from './api-base';
import type {
  MirrorRepositoryDto,
  OciUpstreamDto,
  RepositoriesResponse,
  RepositoryPackagesResponse,
  UpstreamsResponse,
} from './dto';

/**
 * Everything this app reads, and it reads from exactly one upstream: qits-platform-mirror, through
 * the gateway, at `/mirror/api`. There is nothing to join against — the mirror holds caches and the
 * table of registries they front, and no other service knows anything about either.
 *
 * Both calls are one-shot: `firstValueFrom` unwraps the observable immediately, because a promise
 * is what the pages' `async` methods want. `HttpClient` on the fetch backend rather than bare
 * `fetch()` buys two things — `HttpTestingController`, which is the whole basis of this
 * repository's specs, and a call that goes through `window.fetch`, where the platform's browser
 * telemetry can see it.
 *
 * **Both answers are enveloped, and the envelope is unwrapped here rather than in a page.** A bare
 * array on the wire has nowhere to put a field the service later wants to add — a generated-at
 * stamp, a paging cursor — so the service sends an object and this seam hands the pages the list.
 *
 * **Nothing here writes.** The mirror's caches are filled by clients pulling through them and
 * emptied by a nightly eviction run; there is no route to seed one and no button that could exist.
 * The upstream table has a CRUD surface in the service's plan, and when it lands it lands here as
 * a method — not as a `fetch()` in a component.
 *
 * `httpResource()` would suit these reads well and is deliberately not used: it is still marked
 * experimental in the pinned `@angular/common`, and this service is the seam that makes adopting
 * it later a change inside the page components rather than a rewrite.
 */
@Injectable({ providedIn: 'root' })
export class MirrorApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(QITS_API_BASE);

  /**
   * Every cached repository, with the wire type that says which format it fronts.
   *
   * The type is what makes a row readable at all: `npm-proxy`, `maven-proxy` and `oci-mirror` are
   * the three the service registers, and each carries its own eviction window.
   */
  async repositories(): Promise<readonly MirrorRepositoryDto[]> {
    const response = await firstValueFrom(
      this.http.get<RepositoriesResponse>(`${this.base}/mirror/api/repositories`),
    );
    return response.repositories;
  }

  async packages(repository: string): Promise<RepositoryPackagesResponse> {
    return firstValueFrom(
      this.http.get<RepositoryPackagesResponse>(
        `${this.base}/mirror/api/repositories/${encodeURIComponent(repository)}/packages`,
      ),
    );
  }

  /**
   * The OCI registries this mirror fronts, as rows of `oci_mirror_upstream`.
   *
   * This is a table rather than a config key because which registries are mirrored is a thing an
   * operator changes, and a config key is invisible. `host` is the name a docker client uses —
   * `docker.io` stays `docker.io` here, and the hop to `registry-1.docker.io` is the service's.
   */
  async upstreams(): Promise<readonly OciUpstreamDto[]> {
    const response = await firstValueFrom(
      this.http.get<UpstreamsResponse>(`${this.base}/mirror/api/upstreams`),
    );
    return response.upstreams;
  }
}
