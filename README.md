# QitsPlatformSpaMirror

The mirror explorer: what this platform has pulled through its caches, and which registries it
fronts. Served by qits-platform-mirror itself at `/mirror/` through Quinoa. Two pages, and both of
them are read.

- **`/mirror/`** — every cached repository, with the wire type that says which format it fronts:
  `npm-proxy`, `maven-proxy`, `oci-mirror`.
- **`/mirror/upstreams`** — the OCI registries this mirror fronts, as rows of `oci_mirror_upstream`.

**This is the mirror, not the store.** Nothing here was published to this platform: every byte came
from npmjs, Maven Central or a mirrored image registry, and can be fetched again — which is what
lets a nightly eviction run drop whatever nobody has asked for lately. What the platform publishes
itself lives in qits-artifacts, at `/artifacts/`, with its own explorer.

**Only OCI has an upstreams page, and that is the design rather than an omission.** npm and maven
have one upstream each and it is a deployment setting on the service. Which _image_ registries are
mirrored is a set an operator changes, so the service holds it in a table — and a set that lives
only in configuration is a set nobody can look at. This is the looking.

**A failed read is drawn as a failure, never as an empty mirror.** The two states lead an operator
in opposite directions: "nothing has been pulled through yet" is a quiet morning, "nobody answered"
is an incident. So an error renders as an error, with its reason and a retry, and no table is drawn
beside it. `src/app/ui/loadable.ts` exists for that one distinction.

**Fields this client was never told about are drawn, not dropped.** The contract promises `name` and
`type` on a repository and `host` on an upstream. The service is being built alongside this client
and will grow item counts, sizes and last-hit times before either has a reason to release, so
anything extra in a row gets a column of its own, headed by its own field name and rendered by what
the value _is_ — a number stays a number, never a byte figure with a unit this client guessed. See
`src/app/ui/extras.ts`; the restraint is the point.

`src/app/api/` holds hand-written interfaces mirroring the service's wire shapes and one injectable
over `HttpClient` on the fetch backend. Nothing is generated: the platform generates OpenAPI
documents rather than clients.

## How it is served

qits-platform-mirror carries this repository as a git submodule at `service/src/main/webui` —
Quinoa's `web-ui-dir` — and builds it during `mvn package`, serving the bundle at `/mirror/`. The
segment is spelled here as `baseHref` in `angular.json` and there as `quarkus.quinoa.ui-root-path`;
the two move together. This repository ships no container image of its own.

Note the known wart, which is every client's alike: bare `/mirror` (no trailing slash) is a 404.
`/mirror/` works.

## Development server

```bash
ng serve
```

Then open `http://localhost:4200/`. `proxy.conf.json` forwards `/mirror/api` to a gateway on
`localhost:8080`, because `ng serve` puts no gateway in front. In a deployment every call is a
same-origin path behind the real gateway. These reads carry no credential in either case.

The platform chrome asks the gateway for `/main-navigation`, which `ng serve` does not proxy — so
the sidebar renders "Navigation unavailable" locally, and this app's own two views appear beneath
it. That is the intended degraded state, not a fault.

## Running the checks

```bash
npm run lint && npm test && npm run build
```

The same three, in the same order, are what `.config/qits/ci-post-receive.yml` runs on every push.
Note what that pipeline installs from: the npm proxy behind it **is** qits-platform-mirror, and the
`@qits` scope comes from qits-artifacts — so a run here cannot be green while either service is
down. Their deploys are taken alone, with the CI queue empty.

## Building

```bash
ng build
```

The bundle lands in `dist/qits-platform-spa-mirror/browser`, which is the path
`quarkus.quinoa.build-dir` names on the service side.

## Running unit tests

```bash
ng test
```

Vitest on jsdom — no browser, which is what lets CI run them.
