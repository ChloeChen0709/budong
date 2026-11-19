import type { BookState, Pack } from "./types";

const KEY = "budong.v1";              // 每本书一份：budong.v1.<bookId>

export const storeKey = (bookId: string) => `${KEY}.${bookId}`;

export function emptyState(pack: Pack): BookState {
  return {
    bookId: pack.id,
    notes: structuredClone(pack.notes),
    srs: {},
    vocabDay: {},
    vocabGoal: 30,
    updatedAt: Date.now(),
  };
}

export function loadState(pack: Pack): BookState {
  try {
    const raw = localStorage.getItem(storeKey(pack.id));
    if (!raw) return emptyState(pack);
    const parsed = JSON.parse(raw) as BookState;
    return { ...emptyState(pack), ...parsed, bookId: pack.id };
  } catch {
    return emptyState(pack);
  }
}

export function saveState(state: BookState): boolean {
  try {
    localStorage.setItem(storeKey(state.bookId), JSON.stringify({ ...state, updatedAt: Date.now() }));
    localStorage.setItem(`${KEY}.last`, state.bookId);
    return true;
  } catch {
    return false;
  }
}

export function lastBookId(): string | null {
  return localStorage.getItem(`${KEY}.last`);
}

/** 旧单文件版的键搬到新命名空间，只搬一次，不覆盖已有新键 */
export function migrateLegacy(): void {
  const map: Record<string, string> = {
    "cuotiben.v2": KEY,
    "cuotiben.api.v1": "budong.api.v1",
    "cuotiben.backupAt": "budong.backupAt",
  };
  const olds: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("cuotiben")) olds.push(k);
  }
  for (const k of olds) {
    const target =
      map[k] ??
      (k.startsWith("cuotiben.v2.") ? KEY + k.slice("cuotiben.v2".length) : null);
    if (target && localStorage.getItem(target) === null) {
      localStorage.setItem(target, localStorage.getItem(k)!);
    }
  }
}
