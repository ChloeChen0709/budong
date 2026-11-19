import { PACKS } from "../data/packs";

export default function Shelf({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="shelf">
      <p className="eyebrow">选择书目</p>
      <ul className="books">
        {PACKS.map((p) => (
          <li key={p.id}>
            <button className="book" onClick={() => onOpen(p.id)}>
              <span className="mark">{p.mark ?? p.name.slice(0, 1)}</span>
              <span className="name">{p.name}</span>
              {p.tagline && <span className="tagline">{p.tagline}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
