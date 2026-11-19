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
        <span className="brand">budong</span>
        <button className="avatar" onClick={onAccount} aria-label="我的">
          <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
            <circle cx="12" cy="8.2" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M4.8 20c0-3.6 3.2-6 7.2-6s7.2 2.4 7.2 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
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
