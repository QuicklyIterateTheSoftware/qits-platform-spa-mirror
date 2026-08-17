import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QitsBadge, QitsButton } from '@qits/ui-components';
import { MirrorApi } from '../api/mirror-api';
import type { CachedPackageDto, RepositoryPackagesResponse } from '../api/dto';
import { Async } from '../ui/async';
import { Empty } from '../ui/empty';
import { LOADING, failed, ready, type Loadable } from '../ui/loadable';
import { typeTone } from '../ui/mirror-type';

@Component({
  selector: 'app-repository-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Async, Empty, QitsBadge, QitsButton, RouterLink],
  templateUrl: './repository-page.html',
  styleUrls: ['../ui/page.css', './repository-page.css'],
})
export class RepositoryPage {
  private readonly api = inject(MirrorApi);
  protected readonly name = inject(ActivatedRoute).snapshot.paramMap.get('repository') ?? '';
  protected readonly typeTone = typeTone;
  protected readonly state = signal<Loadable<RepositoryPackagesResponse>>(LOADING);
  protected readonly query = signal('');
  protected readonly selected = signal<CachedPackageDto | null>(null);
  protected readonly data = computed(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.value : null;
  });
  protected readonly packages = computed(() => {
    const state = this.state();
    if (state.kind !== 'ready') return [];
    const needle = this.query().trim().toLocaleLowerCase();
    return needle ? state.value.packages.filter((item) => item.name.toLocaleLowerCase().includes(needle)) : state.value.packages;
  });
  protected readonly totalVersions = computed(() => this.packages().reduce((sum, item) => sum + item.versions.length, 0));
  constructor() { void this.load(); }
  protected async load(): Promise<void> {
    this.state.set(LOADING);
    try {
      const response = await this.api.packages(this.name);
      this.state.set(ready(response));
      this.selected.set(response.packages[0] ?? null);
    } catch (error) { this.state.set(failed(error)); }
  }
  protected choose(item: CachedPackageDto): void { this.selected.set(item); }
  protected setQuery(event: Event): void { this.query.set((event.target as HTMLInputElement).value); }
  protected bytes(value: number): string {
    if (!value) return '—';
    const units = ['B', 'KB', 'MB', 'GB']; let amount = value; let unit = 0;
    while (amount >= 1000 && unit < units.length - 1) { amount /= 1000; unit += 1; }
    return `${amount.toFixed(amount < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
  }
}
