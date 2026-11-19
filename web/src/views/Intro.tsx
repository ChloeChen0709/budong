import { useEffect, useState } from "react";

/** 开场：花体字与一句话，5.5 秒后自己淡出，点一下立刻跳过 */
export default function Intro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 5200);
    const t2 = window.setTimeout(onDone, 6000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`intro${leaving ? " out" : ""}`}
      onClick={() => setLeaving(true)}
      role="presentation"
    >
      <div className="intro-inner">
        <h1>budong</h1>
        <p>Stay hungry. Stay foolish.</p>
      </div>
    </div>
  );
}
