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
      <div className="shelf-head">
        <p className="eyebrow">选择书目</p>
        <button className="link" onClick={onAccount}>我的</button>
      </div>
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
