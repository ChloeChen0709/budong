import type { BookState, Pack, SectionNote } from "./types";

const KEY = "budong.v1";              // 每本书一份：budong.v1.<bookId>

export const storeKey = (bookId: string) => `${KEY}.${bookId}`;

export function emptyState(pack: Pack): BookState {
  return {
    bookId: pack.id,
    items: [],
    notes: structuredClone(pack.notes),
    srs: {},
    vocabDay: {},
    vocabGoal: 30,
    updatedAt: Date.now(),
  };
}

/** 本地快照里空着的节，用内容包补齐（旧版本留下的空壳会一直显示空白） */
function fillFromPack(notes: Record<string, SectionNote>, pack: Pack) {
  const out: Record<string, SectionNote> = {};
  const ids = new Set([...Object.keys(pack.notes), ...Object.keys(notes)]);
  for (const id of ids) {
    const src = pack.notes[id];
    const cur = notes[id];
    const merged: SectionNote = { ...(cur ?? {}) };
    for (const field of ["concepts", "types", "examples", "pages"] as const) {
      const mine = merged[field] as unknown[] | undefined;
      const theirs = src ? (src[field] as unknown[] | undefined) : undefined;
      if ((!mine || mine.length === 0) && theirs?.length) {
        (merged as Record<string, unknown>)[field] = structuredClone(theirs);
      }
    }
    if (src) {
      if (merged.plain === undefined && src.plain !== undefined) merged.plain = src.plain;
      if (merged.typesStyle === undefined && src.typesStyle !== undefined) merged.typesStyle = src.typesStyle;
    }
    out[id] = merged;
  }
  return out;
}

export function loadState(pack: Pack): BookState {
  try {
    const raw = localStorage.getItem(storeKey(pack.id));
    if (!raw) return emptyState(pack);
    const parsed = JSON.parse(raw) as BookState;
    const base = { ...emptyState(pack), ...parsed, bookId: pack.id };
    base.notes = fillFromPack(base.notes ?? {}, pack);
    return base;
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
