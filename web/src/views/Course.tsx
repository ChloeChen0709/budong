import { useMemo, useState } from "react";
import type { BookState, Cause, Item, Pack } from "../data/types";
import { CAUSES, causeOf, classify, dueItems, dueLabel, levelOf, masteryOf, newItem, reviewItem } from "../data/course";
import Notes from "./Notes";
import MathInput from "../components/MathInput";
import CropDialog from "../components/CropDialog";
import Explain from "../components/Explain";
import { MathText } from "../lib/math";
import { exportPdf } from "../lib/print";

type CourseTab = "map" | "items" | "review" | "notes";
const TABS: [CourseTab, string][] = [
  ["map", "薄弱点"],
  ["items", "错题"],
  ["review", "复习"],
  ["notes", "知识点"],
];

export default function Course({
  pack,
  state,
  onChange,
}: {
  pack: Pack;
  state: BookState;
  onChange: (next: BookState) => void;
}) {
  const [tab, setTab] = useState<CourseTab>("map");
  const items = state.items ?? [];

  const update = (list: Item[]) => onChange({ ...state, items: list });

  return (
    <div className="course">
      <div className="coursebar">
        <button className="link" onClick={() => exportPdf(pack, state)}>
          导出 PDF
        </button>
      </div>
      <nav className="modes">
        {TABS.map(([k, label]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "map" && <Map pack={pack} items={items} onPick={() => setTab("items")} />}
      {tab === "items" && <Items pack={pack} items={items} onChange={update} />}
      {tab === "review" && <Review pack={pack} items={items} onChange={update} />}
      {tab === "notes" && <Notes pack={pack} state={state} />}
    </div>
  );
}

function Map({ pack, items, onPick }: { pack: Pack; items: Item[]; onPick: () => void }) {
  const sections = pack.book.chapters.flatMap((c) => c.sections.map((s) => ({ ...s, ch: c.title })));
  const worst = [...sections].sort((a, b) => masteryOf(items, a.id) - masteryOf(items, b.id))[0];
  const top = items.length
    ? `共 ${items.length} 道错题，最该看的是「${worst?.id} ${worst?.title}」`
    : "还没有错题";

  return (
    <div className="map">
      <p className="lead">{top}</p>
      <ul className="mrows">
        {sections.map((s) => {
          const lv = levelOf(items, s.id);
          const n = items.filter((i) => i.sec === s.id).length;
          if (!lv) return null;
          return (
            <li key={s.id} className={lv}>
              <span className="sec">
                {s.id} {s.title}
              </span>
              <span className="num">{n}</span>
            </li>
          );
        })}
      </ul>
      {!items.length && (
        <button className="wide" onClick={onPick}>
          去记第一道
        </button>
      )}
    </div>
  );
}

function Items({ pack, items, onChange }: { pack: Pack; items: Item[]; onChange: (v: Item[]) => void }) {
  const [adding, setAdding] = useState(false);
  const sections = pack.book.chapters.flatMap((c) => c.sections);

  return (
    <div className="items">
      <div className="rowhead">
        <span>{items.length} 道</span>
        <button className="link" onClick={() => setAdding((v) => !v)}>
          {adding ? "收起" : "记一道"}
        </button>
      </div>

      {adding && (
        <AddForm
          pack={pack}
          onCancel={() => setAdding(false)}
          onAdd={(it) => {
            onChange([it, ...items]);
            setAdding(false);
          }}
        />
      )}

      <ul className="ilist">
        {items.map((it) => (
          <li key={it.id}>
            <div className="q"><MathText text={it.q} /></div>
            <div className="meta">
              <span className="dot" style={{ background: causeOf(it.cause).color }} />
              {causeOf(it.cause).name}
              <span className="sep">·</span>
              {sections.find((s) => s.id === it.sec)?.title ?? it.sec}
              <span className="sep">·</span>
              {dueLabel(it.due)}
              {it.lapses > 0 && <span className="lap">错 {it.lapses} 次</span>}
            </div>
            {it.img && <img className="thumb" src={it.img} alt="" />}
            <Explain item={it} pack={pack} />
            <button
              className="del"
              onClick={() => onChange(items.filter((x) => x.id !== it.id))}
              aria-label="删除"
            >
              删除
            </button>
          </li>
        ))}
      </ul>
      {!items.length && <p className="hint">还没有错题。</p>}
    </div>
  );
}

function AddForm({
  pack,
  onAdd,
  onCancel,
}: {
  pack: Pack;
  onAdd: (it: Item) => void;
  onCancel: () => void;
}) {
  const [q, setQ] = useState("");
  const [cause, setCause] = useState<Cause>("unknown");
  const [img, setImg] = useState<string | undefined>();
  const [crop, setCrop] = useState<File | undefined>();
  const auto = useMemo(() => classify(q, pack), [q, pack]);
  const [sec, setSec] = useState("");

  const sections = pack.book.chapters.flatMap((c) => c.sections);
  const target = sec || auto.sec || sections[0]?.id;

  const pick = (file: File) => setCrop(file);

  return (
    <div className="addform">
      <MathInput value={q} onChange={setQ} rows={4} placeholder="题目，可用下方键盘输入符号" />
      {q.includes("\\") && <p className="preview"><MathText text={q} /></p>}
      <div className="chips">
        {CAUSES.map((c) => (
          <button key={c.k} className={cause === c.k ? "on" : ""} onClick={() => setCause(c.k)}>
            {c.name}
          </button>
        ))}
      </div>
      <label className="field">
        章节
        <select value={target} onChange={(e) => setSec(e.target.value)}>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} {s.title}
            </option>
          ))}
        </select>
      </label>
      {auto.sec && !sec && (
        <p className="hint">按关键词自动归到「{auto.sec}」，命中了 {auto.hit.join("、")}</p>
      )}
      <label className="file">
        附图
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && void pick(e.target.files[0])} />
      </label>
      {img && <img className="thumb" src={img} alt="" />}
      {crop && (
        <CropDialog
          file={crop}
          onCancel={() => setCrop(undefined)}
          onDone={(url) => {
            setImg(url);
            setCrop(undefined);
          }}
        />
      )}
      <div className="formfoot">
        <button onClick={onCancel}>取消</button>
        <button
          className="primary"
          disabled={!q.trim()}
          onClick={() => onAdd(newItem({ q: q.trim(), sec: target, cause, img }))}
        >
          保存
        </button>
      </div>
    </div>
  );
}

function Review({ pack, items, onChange }: { pack: Pack; items: Item[]; onChange: (v: Item[]) => void }) {
  const due = dueItems({ items } as BookState);
  const sections = pack.book.chapters.flatMap((c) => c.sections);

  if (!due.length) return <p className="hint">今天没有到期的题。</p>;

  return (
    <ul className="ilist">
      {due.map((it) => (
        <li key={it.id}>
          <div className="q">{it.q}</div>
          <div className="meta">
            {sections.find((s) => s.id === it.sec)?.title ?? it.sec}
            <span className="sep">·</span>
            {causeOf(it.cause).name}
          </div>
          <div className="rv">
            <button onClick={() => onChange(items.map((x) => (x.id === it.id ? reviewItem(x, false) : x)))}>
              再来一次
            </button>
            <button
              className="primary"
              onClick={() => onChange(items.map((x) => (x.id === it.id ? reviewItem(x, true) : x)))}
            >
              记住了
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}


