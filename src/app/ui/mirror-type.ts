import type { QitsBadgeTone } from '@qits/ui-components';

/**
 * A cache type, said in the UI's words.
 *
 * Tones are semantic and deliberately quiet. Nothing on these pages is a status — a cache with
 * nothing in it is not failing, it is a cache nobody has pulled through yet — so no type is drawn
 * in a warning colour, and the colours carry one distinction only: which of the three formats a
 * row belongs to.
 *
 * An unrecognised type is drawn neutral rather than hidden. The service decides which types it
 * registers, and this list is a display convenience, never a filter.
 */
export function typeTone(type: string): QitsBadgeTone {
  switch (type) {
    case 'oci-mirror':
      return 'info';
    case 'npm-proxy':
      return 'success';
    case 'maven-proxy':
      return 'neutral';
    default:
      return 'neutral';
  }
}

/** One sentence about what a cache of this type holds. Empty for a type this client has not met. */
export function typeSummary(type: string): string {
  switch (type) {
    case 'npm-proxy':
      return 'Packages pulled through from registry.npmjs.org.';
    case 'maven-proxy':
      return 'Artifacts pulled through from repo1.maven.org.';
    case 'oci-mirror':
      return 'Image layers and manifests pulled through from a mirrored registry.';
    default:
      return '';
  }
}
