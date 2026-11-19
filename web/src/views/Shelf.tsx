import { PACKS } from "../data/packs";

export default function Shelf({
  onOpen,
  onAccount,
}: {
  onOpen: (id: string) => void;
  onAccount: () => void;
}) {
  return (
    <div className="shelf">
      <header className="shelf-top">
        <span className="brand">不懂</span>
        <button className="avatar" onClick={onAccount} aria-label="我的">
          <span>我</span>
        </button>
      </header>
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
