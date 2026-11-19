import { useMemo, useState } from "react";
import type { BookState, Pack } from "../data/types";
import { MathText } from "../lib/math";

export default function Notes({ pack, state }: { pack: Pack; state: BookState }) {
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  const section = useMemo(
    () => pack.book.chapters.flatMap((c) => c.sections).find((s) => s.id === sectionId) ?? null,
    [pack, sectionId]
  );
  const chapterName =
    pack.book.chapters.find((c) => c.sections.some((s) => s.id === sectionId))?.title ?? "";
  const note = section ? state.notes[section.id] : null;

  if (section && note) {
    return (
      <article className="section">
        {zoom && (
          <div className="zoom" onClick={() => setZoom(null)}>
            <img src={zoom} alt="" />
          </div>
        )}
        <button className="crumb" onClick={() => setSectionId(null)}>
          ← {chapterName}
        </button>
        <h2>
          {section.id} {section.title}
        </h2>

        {!note.concepts?.length && !note.types?.length && !note.examples?.length && (
          <p className="hint">这一节的内容还在整理</p>
        )}

        {!!note.concepts?.length && (
          <section className="nblock">
            <h3>概念</h3>
            <ul className="concepts">
              {note.concepts.map((c, i) => (
                <li key={i}><MathText text={c} /></li>
              ))}
            </ul>
          </section>
        )}

        {!!note.types?.length && note.typesStyle !== "scene" && (
          <section className="nblock">
            <h3>重点题型</h3>
            <div className="cards">
              {note.types.map((t, i) =>
                typeof t === "string" ? (
                  <p className="plainline" key={i}>
                    {t}
                  </p>
                ) : (
                  <details key={i}>
                    <summary><MathText text={t.t} /></summary>
                    <div className="body">
                      <p><MathText text={t.how} /></p>
                    </div>
                  </details>
                )
              )}
            </div>
          </section>
        )}

        {note.typesStyle === "scene" && !!note.types?.length && (
          <div className="scenes">
            {note.types.map((t, i) => {
              if (typeof t !== "string") return null;
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

        {!!note.pages?.length && (
          <section className="nblock">
            <h3>例题</h3>
            <div className="pages">
              {note.pages.map((src) => (
                <button
                  className="page"
                  key={src}
                  onClick={() => setZoom(`${import.meta.env.BASE_URL}${src}`)}
                >
                  <img src={`${import.meta.env.BASE_URL}${src}`} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        )}

        {!!note.answers?.length && (
          <section className="nblock">
            <details className="ans">
              <summary>参考答案</summary>
              <div className="pages">
                {note.answers.map((src) => (
                  <button
                    className="page"
                    key={src}
                    onClick={() => setZoom(`${import.meta.env.BASE_URL}${src}`)}
                  >
                    <img src={`${import.meta.env.BASE_URL}${src}`} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </details>
          </section>
        )}

        {!!note.pitfalls?.length && (
          <section className="nblock">
            <h3>易错点</h3>
            <ul className="pitfalls">
              {note.pitfalls.map((p, i) => (
                <li key={i}><MathText text={p} /></li>
              ))}
            </ul>
          </section>
        )}

        {!note.pages?.length && !!note.examples?.length && (
          <section className="nblock">
            <h3>例题</h3>
            <ol className="exs">
              {note.examples.map((e, i) => (
                <li key={i}>
                  <span className="no">{i + 1}</span>
                  <div className="q"><MathText text={e.q} /></div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>
    );
  }

  return (
    <div className="notes">
      {pack.book.chapters.map((c) => (
        <section className="toc" key={c.no}>
          <h3>{c.title}</h3>
          <ul>
            {c.sections.map((sec) => {
              const nt = state.notes[sec.id];
              const empty = !nt || (!nt.concepts?.length && !nt.types?.length && !nt.examples?.length);
              return (
                <li key={sec.id}>
                  <button onClick={() => setSectionId(sec.id)} className={empty ? "empty" : ""}>
                    <span className="id">{sec.id}</span>
                    <span className="tt">{sec.title}</span>
                    {empty ? <span className="mark">整理中</span> : <span className="arrow">›</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
