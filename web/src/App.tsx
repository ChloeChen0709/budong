import { useEffect, useMemo, useState } from "react";
import { PACKS, packById } from "./data/packs";
import { lastBookId, loadState, migrateLegacy, saveState } from "./data/store";
import type { BookState } from "./data/types";
import Shelf from "./views/Shelf";
import Notes from "./views/Notes";
import Vocab from "./views/Vocab";
import Account from "./views/Account";

type Tab = "notes" | "vocab" | "account";

export default function App() {
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

  const book = useMemo(() => (pack && state ? { pack, state } : null), [pack, state]);

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
        {book && tab === "notes" && <Notes pack={book.pack} state={book.state} />}
        {book && tab === "vocab" && <Vocab pack={book.pack} state={book.state} onChange={update} />}
        {tab === "account" && <Account />}
        {book && tab === "vocab" && pack.mode !== "exam" && (
          <p className="hint">这本书没有词表。</p>
        )}
      </main>

      <nav className="tabbar">
        <button className={tab === "notes" ? "on" : ""} onClick={() => setTab("notes")}>
          知识点
        </button>
        <button
          className={tab === "vocab" ? "on" : ""}
          onClick={() => setTab("vocab")}
          disabled={pack.mode !== "exam"}
        >
          词汇
        </button>
        <button className={tab === "account" ? "on" : ""} onClick={() => setTab("account")}>
          我的
        </button>
      </nav>
    </div>
  );
}
