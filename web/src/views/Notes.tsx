import { useMemo, useState } from "react";
import type { BookState, Pack } from "../data/types";
import { MathText } from "../lib/math";

export default function Notes({ pack, state }: { pack: Pack; state: BookState }) {
  const [chapter, setChapter] = useState(0);
  const [sectionId, setSectionId] = useState<string | null>(null);

  const chapterData = pack.book.chapters[chapter];
  const section = useMemo(
    () => chapterData?.sections.find((s) => s.id === sectionId) ?? null,
    [chapterData, sectionId]
  );
  const note = section ? state.notes[section.id] : null;

  if (section && note) {
    return (
      <article className="section">
        <button className="crumb" onClick={() => setSectionId(null)}>
          ← {chapterData.title}
        </button>
        <h2>
          {section.id} {section.title}
        </h2>

        {!!note.concepts?.length && (
          <ul className="concepts">
            {note.concepts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}

        {note.typesStyle === "scene" && !!note.types?.length && (
          <div className="scenes">
            {note.types.map((t, i) => {
              const [head, ...rest] = t.split(/[：:]/);
              return (
                <div className="scene" key={i}>
                  <b>{head}</b>
                  <p>{rest.join("：")}</p>
                </div>
              );
            })}
          </div>
        )}

        {!!note.examples?.length &&
          (note.plain ? (
            <dl className="pairs">
              {note.examples.map((e, i) => (
                <div className="pair" key={i}>
                  <dt><MathText text={e.q} /></dt>
                  <dd><MathText text={e.a ?? ""} /></dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="cards">
              {note.examples.map((e, i) => (
                <details key={i}>
                  <summary><MathText text={e.q} /></summary>
                  <div className="body">
                    {e.a && <p><MathText text={e.a} /></p>}
                    {e.analysis && <p className="note"><MathText text={e.analysis} /></p>}
                  </div>
                </details>
              ))}
            </div>
          ))}
      </article>
    );
  }

  return (
    <div className="notes">
      <nav className="modules">
        {pack.book.chapters.map((c, i) => (
          <button key={c.no} className={i === chapter ? "on" : ""} onClick={() => setChapter(i)}>
            {c.title}
          </button>
        ))}
      </nav>

      {chapterData?.sections.length ? (
        <ul className="sections">
          {chapterData.sections.map((s) => (
            <li key={s.id}>
              <button onClick={() => setSectionId(s.id)}>
                <span>
                  {s.id} {s.title}
                </span>
                <span className="arrow">›</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">这一部分还没有内容。</p>
      )}
    </div>
  );
}
