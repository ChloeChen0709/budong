import { useEffect, useMemo, useState } from "react";
import { PACKS, packById } from "./data/packs";
import { lastBookId, loadState, migrateLegacy, saveState } from "./data/store";
import type { BookState } from "./data/types";
import Shelf from "./views/Shelf";
import Notes from "./views/Notes";
import Course from "./views/Course";
import Intro from "./views/Intro";
import Vocab from "./views/Vocab";
import Account from "./views/Account";
import { useSync } from "./data/useSync";

type Tab = "notes" | "vocab" | "account";

export default function App() {
  const [intro, setIntro] = useState(true);
  const [bookId, setBookId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("notes");
  const [state, setState] = useState<BookState | null>(null);

  useEffect(() => {
    migrateLegacy();
    const last = lastBookId();
    if (last && PACKS.some((p) => p.id === last)) {
      setBookId(last);
    }
  }, []);

  const pack = bookId ? packById(bookId) : null;

  useEffect(() => {
    if (!pack) return;
    setState(loadState(pack));
  }, [pack]);

  const update = (next: BookState) => {
    setState(next);
    saveState(next);
  };

  const syncStatus = useSync(state, update);

  const book = useMemo(() => (pack && state ? { pack, state } : null), [pack, state]);

  if (intro) return <Intro onDone={() => setIntro(false)} />;

  if (!pack) {
    return <Shelf onOpen={(id) => { setBookId(id); setTab("notes"); }} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="back" onClick={() => setBookId(null)} aria-label="返回书架">
          ←
        </button>
        <h1>{pack.name}</h1>
        <span className={`badge ${pack.mode}`}>{pack.mode === "exam" ? "知识点" : "错题本"}</span>
      </header>

      <main className="content">
        {book && pack.mode === "course" && tab !== "account" && (
          <Course pack={book.pack} state={book.state} onChange={update} />
        )}
        {book && pack.mode === "exam" && tab === "notes" && (
          <Notes pack={book.pack} state={book.state} />
        )}
        {book && pack.mode === "exam" && tab === "vocab" && (
          <Vocab pack={book.pack} state={book.state} onChange={update} />
        )}
        {tab === "account" && <Account />}
      </main>

      {syncStatus !== "off" && (
        <div className={`sync ${syncStatus}`}>
          {syncStatus === "idle" ? "已同步" : syncStatus === "pulling" ? "同步中" : syncStatus === "pushing" ? "上传中" : "同步失败"}
        </div>
      )}

      <nav className={`tabbar ${pack.mode === "course" ? "two" : ""}`}>
        <button className={tab === "notes" ? "on" : ""} onClick={() => setTab("notes")}>
          {pack.mode === "course" ? "学习" : "知识点"}
        </button>
        {pack.mode === "exam" && (
          <button className={tab === "vocab" ? "on" : ""} onClick={() => setTab("vocab")}>
            词汇
          </button>
        )}
        <button className={tab === "account" ? "on" : ""} onClick={() => setTab("account")}>
          我的
        </button>
      </nav>
    </div>
  );
}
