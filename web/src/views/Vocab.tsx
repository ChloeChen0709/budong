import { useMemo, useRef, useState } from "react";
import type { BookState, Entry, Pack } from "../data/types";
import { buildQueue, markWord, vocabStats, type Kind, type Mark } from "../data/vocab";

export default function Vocab({
  pack,
  state,
  onChange,
}: {
  pack: Pack;
  state: BookState;
  onChange: (next: BookState) => void;
}) {
  const [kind, setKind] = useState<Kind>("w");
  const [queue, setQueue] = useState<Entry[] | null>(null);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [deckIndex, setDeckIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);

  const deckDown = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };
  const deckMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    setDrag(Math.max(-40, Math.min(40, dx / 4)));
  };
  const deckUp = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -40) setDeckIndex(1);
    else if (dx > 40) setDeckIndex(0);
    setDrag(0);
  };

  const stats = useMemo(() => vocabStats(state, kind), [state, kind]);
  const today = state.vocabDay[new Date().toISOString().slice(0, 10)] ?? 0;
  const goal = state.vocabGoal;

  const start = (k: Kind) => {
    const q = buildQueue(state, k);
    if (!q.length) return;
    setKind(k);
    setQueue(q);
    setIndex(0);
    setShown(false);
  };

  const mark = (m: Mark) => {
    const entry = queue?.[index];
    if (!entry) return;
    onChange(markWord(state, kind, entry.q, m));
    if (index + 1 >= (queue?.length ?? 0)) {
      setQueue(null);
    } else {
      setIndex(index + 1);
      setShown(false);
    }
  };

  if (queue) {
    const entry = queue[index];
    return (
      <div className="study">
        <div className="studybar">
          <span>
            {index + 1} / {queue.length}
          </span>
          <button onClick={() => setQueue(null)}>关闭</button>
        </div>
        <button className="card flip" key={`${kind}-${index}`} onClick={() => setShown(true)}>
          <span className="word">{entry.q}</span>
          {shown && (
            <>
              <span className="mean">{entry.a}</span>
              {entry.analysis && <span className="more">{entry.analysis}</span>}
            </>
          )}
        </button>
        {shown ? (
          <div className="marks">
            <button onClick={() => mark("again")}>不认识</button>
            <button onClick={() => mark("hard")}>模糊</button>
            <button className="primary" onClick={() => mark("know")}>
              认识
            </button>
          </div>
        ) : (
          <button className="wide" onClick={() => setShown(true)}>
            看释义
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="vocab">
      <p className="today">
        今天已背 <b>{today}</b> / {goal}　·　连续 {streak(state)} 天
      </p>
      <div className="deck" onTouchStart={deckDown} onTouchMove={deckMove} onTouchEnd={deckUp}>
        {(
          [
            ["w", "核心词"],
            ["p", "高频词组"],
          ] as [Kind, string][]
        ).map(([k, label], i) => {
          const s = vocabStats(state, k);
          const off = i - deckIndex;
          return (
            <button
              key={k}
              className={`choice card-${off === 0 ? "on" : off > 0 ? "next" : "prev"}`}
              style={{ transform: `translateX(${off * 6 + drag}%) scale(${1 - Math.abs(off) * 0.04})` }}
              onClick={() => (off === 0 ? start(k) : setDeckIndex(i))}
            >
              <span className="title">{label}</span>
              <span className="count">{s.total}</span>
              <span className="sub">
                待复习 {s.due.length} · 生词 {s.weak.length} · 未学 {s.fresh.length}
              </span>
            </button>
          );
        })}
        <div className="dots">
          {[0, 1].map((i) => (
            <span key={i} className={i === deckIndex ? "on" : ""} />
          ))}
        </div>
      </div>
      <ul className="lists">
        <li>
          生词本<b>{stats.weak.length}</b>
        </li>
        <li>
          已掌握<b>{stats.mastered.length}</b>
        </li>
      </ul>
    </div>
  );
}

function streak(state: BookState): number {
  let n = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if ((state.vocabDay[key] ?? 0) > 0) {
      n++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return n;
}
