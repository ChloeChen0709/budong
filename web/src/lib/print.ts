import type { BookState, Pack } from "../data/types";
import { renderMath } from "./math";
import { causeOf } from "../data/course";

const esc = (s: string) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

export function bodyHtml(pack: Pack, state: BookState): string {
  const parts: string[] = [];

  if (pack.mode === "exam") {
    for (const ch of pack.book.chapters) {
      parts.push(`<h1>${esc(ch.no)} ${esc(ch.title)}</h1>`);
      for (const s of ch.sections) {
        const nt = state.notes[s.id];
        if (!nt) continue;
        const has = (nt.concepts?.length ?? 0) + (nt.examples?.length ?? 0);
        if (!has) continue;
        parts.push(`<h2>${esc(s.id)} ${esc(s.title)}</h2>`);
        if (nt.concepts?.length) parts.push(`<ul>${nt.concepts.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`);
        for (const e of nt.examples ?? []) {
          parts.push(`<p>${renderMath(e.q)}<span class="m">${renderMath(e.a ?? "")}</span></p>`);
        }
      }
    }
  } else {
    parts.push(`<h1>${esc(pack.name)} · 错题</h1>`);
    for (const it of state.items ?? []) {
      parts.push(
        `<p>${renderMath(it.q)}<span class="m">${esc(causeOf(it.cause).name)} · ${esc(it.sec)}</span></p>`
      );
      if (it.img) parts.push(`<img src="${it.img}" alt="">`);
    }
  }
  return parts.join("");
}

const PAGE_CSS = `
@page{margin:16mm 15mm}
body{font:12px/1.7 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#111}
h1{font-size:18px;margin:20px 0 8px}
h2{font-size:14px;margin:16px 0 6px}
ul{margin:4px 0 10px;padding-left:18px}
li{margin:3px 0}
p{margin:7px 0;padding-bottom:6px;border-bottom:1px solid #eee}
.m{color:#777;margin-left:10px}
img{max-width:55%;display:block;margin:6px 0}
.frc{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;margin:0 2px}
.frc-n{border-bottom:1px solid currentColor;padding:0 3px}
.frc-d{padding:0 3px}
sup,sub{font-size:.7em;line-height:0}
`;

/**
 * 打印：另开一个只含内容的窗口再调用打印。
 * 不在当前页面上打印，是为了避免清理时机与打印对话框打架。
 */
export function buildPrintHtml(pack: Pack, state: BookState): string {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(pack.name)}</title><style>${PAGE_CSS}</style></head><body>${bodyHtml(pack, state)}</body></html>`;
}

export function exportPdf(pack: Pack, state: BookState) {
  const html = buildPrintHtml(pack, state);

  const win = window.open("", "_blank", "width=880,height=1000");
  if (!win) {
    alert("浏览器拦截了新窗口，请允许弹窗后重试");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}
