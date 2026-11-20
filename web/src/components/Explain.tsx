import { useState } from "react";
import type { Item, Pack } from "../data/types";
import { causeOf } from "../data/course";
import { explainItem, ruleHint, apiCfg } from "../lib/ai";
import { MathText } from "../lib/math";

export default function Explain({ item, pack }: { item: Item; pack: Pack }) {
  const [demo, setDemo] = useState<{ why: string; how: string; fix: string }>();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const sec = pack.book.chapters.flatMap((c) => c.sections).find((s) => s.id === item.sec);
  const cfg = apiCfg();
  const ready = Boolean(cfg.url && cfg.key && cfg.model);

  const run = async () => {
    setBusy(true);
    setNote("");
    try {
      const d = await explainItem({
        book: pack.name,
        sec: sec ? `${sec.id} ${sec.title}` : "未归类",
        cause: causeOf(item.cause).name,
        q: item.q,
      });
      setDemo(d);
      setNote(`由 ${cfg.model} 生成`);
    } catch (e) {
      setDemo(ruleHint());
      setNote(`未接通模型：${e instanceof Error ? e.message : "未知错误"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="explain">
      {!demo && (
        <button className="wide" onClick={run} disabled={busy}>
          {busy ? "讲解中…" : ready ? "让 AI 讲这道" : "看规则提示"}
        </button>
      )}
      {demo && (
        <>
          <div className="blk">
            <span className="tag">错在哪</span>
            <p><MathText text={demo.why} /></p>
          </div>
          <div className="blk">
            <span className="tag">正确思路</span>
            <p><MathText text={demo.how} /></p>
          </div>
          <div className="blk">
            <span className="tag">要补什么</span>
            <p><MathText text={demo.fix} /></p>
          </div>
        </>
      )}
      {note && <p className="hint">{note}</p>}
    </div>
  );
}
