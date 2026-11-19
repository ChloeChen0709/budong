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
  const [sheet, setSheet] = useState<"weak" | "mastered" | "cal" | "goal" | null>(null);
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
      <div className="today">
        <span>今天已背 <b>{today}</b> / {goal}</span>
        <button className="tlink" onClick={() => setSheet("cal")}>连续 {streak(state)} 天</button>
        <button className="tlink" onClick={() => setSheet("goal")}>目标</button>
      </div>
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
              style={{
                transform:
                  off === 0
                    ? `translateY(0) scale(1) translateX(${drag}%)`
                    : off > 0
                    ? "translateY(18px) scale(.94)"
                    : "translateY(-18px) scale(.94)",
                zIndex: off === 0 ? 3 : 2,
              }}
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
          <button className="rowbtn" onClick={() => setSheet("weak")}>
            生词本<b>{stats.weak.length}</b>
          </button>
        </li>
        <li>
          <button className="rowbtn" onClick={() => setSheet("mastered")}>
            已掌握<b>{stats.mastered.length}</b>
          </button>
        </li>
      </ul>

      {sheet && (
        <div className="sheet" onClick={() => setSheet(null)}>
          <div className="sheetbox" onClick={(e) => e.stopPropagation()}>
            {sheet === "goal" ? (
              <div className="goals">
                <h3>每天背多少个</h3>
                {[10, 20, 30, 50, 100].map((g) => (
                  <button
                    key={g}
                    className={g === goal ? "on" : ""}
                    onClick={() => {
                      onChange({ ...state, vocabGoal: g });
                      setSheet(null);
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            ) : sheet === "cal" ? (
              <Calendar days={state.vocabDay} />
            ) : (
              <div className="words">
                <h3>{sheet === "weak" ? "生词本" : "已掌握"}</h3>
                {(sheet === "weak" ? stats.weak : stats.mastered).map((e) => (
                  <p key={e.q}>
                    <span>{e.q}</span>
                    <b>{e.a}</b>
                  </p>
                ))}
                {!(sheet === "weak" ? stats.weak : stats.mastered).length && <p className="hint">暂无</p>}
              </div>
            )}
          </div>
        </div>
      )}
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

function Calendar({ days }: { days: Record<string, number> }) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const total = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array((first + 6) % 7).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  const key = (d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return (
    <div className="cal">
      <h3>{y} 年 {m + 1} 月</h3>
      <div className="calwk">{"一二三四五六日".split("").map((w) => <span key={w}>{w}</span>)}</div>
      <div className="calgrid">
        {cells.map((d, i) => (
          <span key={i} className={d && days[key(d)] ? "has" : ""}>
            {d ?? ""}
            {d && days[key(d)] ? <i>{days[key(d)]}</i> : null}
          </span>
        ))}
      </div>
    </div>
  );
}
