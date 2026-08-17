/**
 * The wire shapes this app reads, hand-written to mirror qits-platform-mirror's admin API.
 *
 * **Two fields are guaranteed and everything else is not, and the types say exactly that.** The
 * backend is being built against this contract in parallel with this client, and it will grow
 * fields — a cached-item count, a last-hit time, an eviction window — before this repository has
 * any reason to release. So each row declares the field it is promised and carries an index
 * signature of `unknown` for the rest: the pages draw whatever arrives without a change here, and
 * nothing in this app can read a field the contract does not promise without going through the
 * narrowing helpers in `ui/extras.ts`.
 *
 * `unknown` rather than `string | number` is the load-bearing part. It makes every extra value
 * un-renderable until something has checked what it is, which is what stops a nested object from
 * being drawn as `[object Object]` in a table cell.
 */

/** One cached repository. `name` and `type` are promised; the rest is whatever the service sends. */
export interface MirrorRepositoryDto {
  /** The repository's name — what a client addresses it by. */
  readonly name: string;
  /** The wire type: `npm-proxy`, `maven-proxy`, `oci-mirror` — the mirror's three. */
  readonly type: string;
  readonly [field: string]: unknown;
}

/** The repositories listing. */
export interface RepositoriesResponse {
  readonly repositories: readonly MirrorRepositoryDto[];
}

export interface CachedPackageVersionDto {
  readonly version: string;
  readonly labels: readonly string[];
  readonly files: readonly string[];
  readonly sizeBytes: number;
  readonly cachedAt: string;
  readonly lastAccessedAt: string | null;
}

export interface CachedPackageDto {
  readonly name: string;
  readonly versions: readonly CachedPackageVersionDto[];
  readonly sizeBytes: number;
  readonly lastAccessedAt: string | null;
}

export interface RepositoryPackagesResponse {
  readonly repository: MirrorRepositoryDto;
  readonly packages: readonly CachedPackageDto[];
}

/** One mirrored OCI registry. `host` is promised; the rest is whatever the service sends. */
export interface OciUpstreamDto {
  /** The host a docker client names — `docker.io`, `ghcr.io`, `quay.io`. */
  readonly host: string;
  readonly [field: string]: unknown;
}

/** The OCI upstreams listing. */
export interface UpstreamsResponse {
  readonly upstreams: readonly OciUpstreamDto[];
}
