import { NONE, cellText, columnLabel, extraColumns } from './extras';

/**
 * The defensive path, asserted directly. It is the part of this client most likely to meet
 * something it was not designed for, so it is the part with the most tests.
 */
describe('extras', () => {
  describe('extraColumns', () => {
    it('drops the promised fields and keeps the order the service sent', () => {
      const rows = [{ name: 'npmjs', type: 'npm-proxy', itemCount: 3, lastHitAt: null }];
      expect(extraColumns(rows, ['name', 'type'])).toEqual(['itemCount', 'lastHitAt']);
    });

    it('gives a field that only the last row carries a column of its own', () => {
      const rows = [{ host: 'docker.io' }, { host: 'ghcr.io', note: 'added by hand' }];
      expect(extraColumns(rows, ['host'])).toEqual(['note']);
    });

    it('names each field once, whatever the rows do', () => {
      const rows = [
        { host: 'docker.io', endpoint: 'https://registry-1.docker.io' },
        { host: 'ghcr.io', endpoint: 'https://ghcr.io' },
      ];
      expect(extraColumns(rows, ['host'])).toEqual(['endpoint']);
    });

    it('is empty when the answer carries only what was promised', () => {
      expect(extraColumns([{ name: 'npmjs', type: 'npm-proxy' }], ['name', 'type'])).toEqual([]);
    });
  });

  describe('columnLabel', () => {
    it('makes a camelCase field readable', () => {
      expect(columnLabel('lastAccessedAt')).toBe('Last accessed at');
    });

    it('makes a snake_case field readable', () => {
      expect(columnLabel('cached_at')).toBe('Cached at');
    });

    it('leaves a single word alone but for its capital', () => {
      expect(columnLabel('endpoint')).toBe('Endpoint');
    });
  });

  describe('cellText', () => {
    it('draws nothing-at-all as one em dash, whichever kind of nothing it is', () => {
      expect(cellText(null)).toBe(NONE);
      expect(cellText(undefined)).toBe(NONE);
      expect(cellText('')).toBe(NONE);
      expect(cellText([])).toBe(NONE);
    });

    it('draws a number as a number, with no unit invented for it', () => {
      expect(cellText(4337916518)).toBe('4,337,916,518');
    });

    it('draws a boolean as a word', () => {
      expect(cellText(true)).toBe('yes');
      expect(cellText(false)).toBe('no');
    });

    it('draws an object as its JSON — ugly and true, rather than [object Object]', () => {
      expect(cellText({ window: 'P30D' })).toBe('{"window":"P30D"}');
    });

    it('draws a list as its members', () => {
      expect(cellText(['npm-proxy', 'oci-mirror'])).toBe('npm-proxy, oci-mirror');
    });
  });
});
