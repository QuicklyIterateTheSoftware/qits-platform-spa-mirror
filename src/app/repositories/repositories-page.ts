import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QitsBadge, QitsButton } from '@qits/ui-components';
import { MirrorApi } from '../api/mirror-api';
import type { MirrorRepositoryDto } from '../api/dto';
import { Async } from '../ui/async';
import { Empty } from '../ui/empty';
import { cellText, columnLabel, extraColumns, fieldOf } from '../ui/extras';
import { LOADING, failed, ready, type Loadable } from '../ui/loadable';
import { typeSummary, typeTone } from '../ui/mirror-type';

/** The fields the contract promises. Everything else becomes a column of its own — see extras.ts. */
const PROMISED = ['name', 'type'] as const;

/**
 * The front door: every repository this mirror caches into, and what format each one fronts.
 *
 * **One read, and nothing per row.** `GET /mirror/api/repositories` answers the whole list. There
 * is no per-repository call to make: what a cache holds is a listing the service does not offer
 * yet, and a page that asked N times to draw N rows would be the wrong shape to grow it into.
 *
 * **A failed read is never drawn as an empty mirror.** The two states lead an operator in opposite
 * directions — "nothing has been pulled through yet" is a quiet morning, "nobody answered" is an
 * incident — so the error is rendered as an error, with the reason and a retry, and the table is
 * not drawn at all. This is the whole reason `Loadable` exists in this repository.
 *
 * **The columns past Type are the service's, not this client's.** `name` and `type` are what the
 * contract promises; the mirror will grow item counts, sizes and last-hit times and this page
 * draws each of them the day it arrives, headed by its own field name. What it will not do is
 * dress an unknown number up as a byte figure — see extras.ts for why that restraint is the point.
 */
@Component({
  selector: 'app-repositories-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Async, Empty, QitsBadge, QitsButton, RouterLink],
  templateUrl: './repositories-page.html',
  styleUrls: ['../ui/page.css'],
})
export class RepositoriesPage {
  private readonly api = inject(MirrorApi);

  protected readonly typeTone = typeTone;
  protected readonly typeSummary = typeSummary;
  protected readonly columnLabel = columnLabel;
  protected readonly cellText = cellText;
  protected readonly fieldOf = fieldOf;

  protected readonly repositories = signal<Loadable<readonly MirrorRepositoryDto[]>>(LOADING);

  /** The rows, once they are here; an empty list otherwise, so the template stays flat. */
  protected readonly rows = computed(() => {
    const state = this.repositories();
    return state.kind === 'ready' ? state.value : [];
  });

  /** The columns beyond Repository and Type, taken from what actually arrived. */
  protected readonly extras = computed(() => extraColumns(this.rows(), PROMISED));

  /** `3 cached repositories.` — the mirror's shape in one clause, above the table. */
  protected readonly lede = computed(() => {
    const rows = this.rows();
    const noun = rows.length === 1 ? 'cached repository' : 'cached repositories';
    return `${rows.length} ${noun}.`;
  });

  constructor() {
    this.load();
  }

  protected async load(): Promise<void> {
    this.repositories.set(LOADING);
    try {
      this.repositories.set(ready(await this.api.repositories()));
    } catch (error) {
      this.repositories.set(failed(error));
    }
  }
}
