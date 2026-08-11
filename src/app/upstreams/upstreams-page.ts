import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { QitsButton } from '@qits/ui-components';
import { MirrorApi } from '../api/mirror-api';
import type { OciUpstreamDto } from '../api/dto';
import { Async } from '../ui/async';
import { Empty } from '../ui/empty';
import { cellText, columnLabel, extraColumns, fieldOf } from '../ui/extras';
import { LOADING, failed, ready, type Loadable } from '../ui/loadable';

/** The field the contract promises. Everything else becomes a column of its own — see extras.ts. */
const PROMISED = ['host'] as const;

/**
 * The OCI registries this mirror fronts — rows of `oci_mirror_upstream`, not a config key.
 *
 * That distinction is the reason this page exists. npm and maven each have exactly one upstream and
 * it is a property of the deployment; which *image* registries are mirrored is a set an operator
 * changes, and a set that lives only in configuration is a set nobody can look at. This is the
 * looking.
 *
 * **`host` is the name a docker client uses**, which is not always the name the bytes come from:
 * `docker.io` is what every client is configured with and `registry-1.docker.io` is what answers.
 * The hop is the service's business and is not invented here — whatever the row carries about it
 * arrives as one more column.
 *
 * **Read-only, today.** The service's plan gives this table a CRUD surface; until it has one, a
 * button here would be a control with nothing behind it. When it lands, it lands as a method on
 * `MirrorApi` and a form on this page.
 */
@Component({
  selector: 'app-upstreams-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Async, Empty, QitsButton],
  templateUrl: './upstreams-page.html',
  styleUrls: ['../ui/page.css'],
})
export class UpstreamsPage {
  private readonly api = inject(MirrorApi);

  protected readonly columnLabel = columnLabel;
  protected readonly cellText = cellText;
  protected readonly fieldOf = fieldOf;

  protected readonly upstreams = signal<Loadable<readonly OciUpstreamDto[]>>(LOADING);

  /** The rows, once they are here; an empty list otherwise, so the template stays flat. */
  protected readonly rows = computed(() => {
    const state = this.upstreams();
    return state.kind === 'ready' ? state.value : [];
  });

  /** The columns beyond Host, taken from what actually arrived. */
  protected readonly extras = computed(() => extraColumns(this.rows(), PROMISED));

  /** `3 mirrored registries.` — the table's shape in one clause, above it. */
  protected readonly lede = computed(() => {
    const rows = this.rows();
    const noun = rows.length === 1 ? 'mirrored registry' : 'mirrored registries';
    return `${rows.length} ${noun}.`;
  });

  constructor() {
    this.load();
  }

  protected async load(): Promise<void> {
    this.upstreams.set(LOADING);
    try {
      this.upstreams.set(ready(await this.api.upstreams()));
    } catch (error) {
      this.upstreams.set(failed(error));
    }
  }
}
