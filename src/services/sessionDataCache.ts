// Business data stays in memory, never in persistent browser storage.
export class SessionDataCache {
  private values = new Map<string, string>();
  generation = 0;

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  clear(): void {
    this.generation++;
    this.values.clear();
  }
}

export const sessionDataCache = new SessionDataCache();

export function removeLegacyBusinessData(): void {
  if (typeof window === 'undefined') return;

  for (const store of [window.localStorage, window.sessionStorage]) {
    for (let i = store.length - 1; i >= 0; i--) {
      const key = store.key(i);
      if (key?.startsWith('ca_laivung_')) {
        store.removeItem(key);
      }
    }
  }
}
