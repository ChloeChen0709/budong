import type { BookState, Cause, Item, Pack } from "./types";

export const CAUSES: { k: Cause; name: string; w: number; color: string; days: number }[] = [
  { k: "unknown", name: "不会", w: 1.0, color: "#b23a2f", days: 1 },
  { k: "calc", name: "算错", w: 0.5, color: "#d68c3c", days: 2 },
  { k: "read", name: "审题", w: 0.7, color: "#4a7fa5", days: 3 },
];

export const causeOf = (k: Cause) => CAUSES.find((c) => c.k === k) ?? CAUSES[0];

export const riskOf = (items: Item[], sec: string) =>
  items
    .filter((i) => i.sec === sec)
    .reduce((n, i) => n + causeOf(i.cause).w * (1 + 0.35 * i.lapses), 0);

export const masteryOf = (items: Item[], sec: string) =>
  Math.max(0.05, Math.min(1, Math.pow(0.55, riskOf(items, sec))));

export function levelOf(items: Item[], sec: string): "" | "h" | "m" | "l" {
  if (!items.some((i) => i.sec === sec)) return "";
  const m = masteryOf(items, sec);
  return m < 0.45 ? "h" : m < 0.75 ? "m" : "l";
}

/** 题干 → 小节：命中该节关键词最多者胜，返回命中的词便于解释 */
export function classify(text: string, pack: Pack): { sec: string | null; hit: string[] } {
  const src = text.toLowerCase();
  let best: { sec: string; hits: string[] } | null = null;

  for (const ch of pack.book.chapters) {
    for (const s of ch.sections) {
      const kws = (s.kw ?? []).filter(Boolean);
      const hits = kws.filter((k) => src.includes(k.toLowerCase()));
      if (hits.length && (!best || hits.length > best.hits.length)) {
        best = { sec: s.id, hits };
      }
    }
  }
  return best ? { sec: best.sec, hit: best.hits } : { sec: null, hit: [] };
}

export function dueLabel(due: number, now = Date.now()): string {
  const d = Math.floor((due - now) / 864e5);
  if (due <= now) return d === 0 ? "今天" : `逾期 ${Math.abs(d)} 天`;
  return d === 0 ? "今天" : `${d} 天后`;
}

export const dueItems = (state: BookState) =>
  (state.items ?? []).filter((i) => i.due <= Date.now());

export function newItem(patch: Partial<Item> & { q: string; sec: string }): Item {
  return {
    id: Math.random().toString(36).slice(2, 9),
    cause: "unknown",
    due: Date.now() + 864e5,
    lapses: 0,
    ...patch,
  };
}

/** 复习一次：记得 → 按错因间隔顺延；忘记 → lapses+1，明天再来 */
export function reviewItem(item: Item, remembered: boolean): Item {
  const days = causeOf(item.cause).days;
  if (remembered) {
    return { ...item, due: Date.now() + days * 864e5 };
  }
  return { ...item, lapses: item.lapses + 1, due: Date.now() + 864e5 };
}
