import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Something that loaded and holds nothing, said in a sentence.
 *
 * It exists so that "this mirror has cached nothing yet" is never drawn as blank space — an empty
 * table that renders nothing is indistinguishable from one whose read failed, and on this page
 * those two facts lead an operator in opposite directions.
 */
@Component({
  selector: 'app-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="empty">{{ message() }}</p>`,
  styles: `
    .empty {
      margin: 0.15rem 0;
      color: #6b7280;
      font-style: italic;
    }
  `,
})
export class Empty {
  readonly message = input.required<string>();
}
