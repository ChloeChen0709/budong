import type { BookState, Entry, SectionNote, SrsRecord } from "./types";

/** 小时：4h 1d 2d 4d 7d 15d 30d */
export const EBB = [4, 24, 48, 96, 168, 360, 720];

export type Kind = "w" | "p";

export const vocabKey = (kind: Kind, word: string) => `${kind}:${word}`;

export const sectionIdOf = (kind: Kind) => (kind === "w" ? "5.1" : "5.2");

export function vocabEntries(notes: Record<string, SectionNote>, kind: Kind): Entry[] {
  return notes[sectionIdOf(kind)]?.examples ?? [];
}

export interface VocabStats {
  total: number;
  due: Entry[];
  fresh: Entry[];
  weak: Entry[];
  mastered: Entry[];
}

export function vocabStats(state: BookState, kind: Kind, now = Date.now()): VocabStats {
  const all = vocabEntries(state.notes, kind);
  const due: Entry[] = [];
  const fresh: Entry[] = [];
  const weak: Entry[] = [];
  const mastered: Entry[] = [];

  for (const e of all) {
    const rec = state.srs[vocabKey(kind, e.q)];
    if (!rec) {
      fresh.push(e);
      continue;
    }
    if (rec.mastered) {
      mastered.push(e);
      continue;
    }
    if (rec.stage <= 1) weak.push(e);
    // 生词不等到期，下一轮直接排进来
    if (rec.stage <= 1 || rec.due <= now) due.push(e);
  }
  return { total: all.length, due, fresh, weak, mastered };
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQueue(state: BookState, kind: Kind, size = 20): Entry[] {
  const s = vocabStats(state, kind);
  return [...shuffle(s.due), ...shuffle(s.fresh)].slice(0, size);
}

export type Mark = "again" | "hard" | "know";

export function markWord(state: BookState, kind: Kind, word: string, mark: Mark): BookState {
  const key = vocabKey(kind, word);
  const prev: SrsRecord = state.srs[key] ?? { stage: 0, seen: 0, due: 0 };
  const rec: SrsRecord = { ...prev, seen: prev.seen + 1 };

  if (mark === "again") {
    rec.stage = 0;
    rec.mastered = false;
  } else if (mark === "hard") {
    rec.stage = Math.max(0, rec.stage - 1);
    rec.mastered = false;
  } else {
    rec.stage = EBB.length - 1;
    rec.mastered = true;
  }
  rec.due = Date.now() + EBB[rec.stage] * 3600_000;

  const day = new Date().toISOString().slice(0, 10);
  return {
    ...state,
    srs: { ...state.srs, [key]: rec },
    vocabDay: { ...state.vocabDay, [day]: (state.vocabDay[day] ?? 0) + 1 },
  };
}
