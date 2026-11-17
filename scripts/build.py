#!/usr/bin/env python3
"""把 src/ 与 packs/<学科>.json 拼成一个可以双击打开的单文件 index.html。

用法：
    python3 scripts/build.py            # 默认 calculus
    python3 scripts/build.py cet46      # 换一个内容包
"""
import json
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
PACKS = ROOT / "packs"
DEFAULT_PACK = "calculus"

# 构建产物同步到的位置（存在才复制）
MIRRORS = [
    ROOT.parent / "错题本.html",
    ROOT.parent / "cuotiben-site" / "index.html",
]


def public_notes(notes):
    """去掉只给校验脚本用的 verify 字段。"""
    out = {}
    for sid, sec in notes.items():
        out[sid] = {
            "concepts": sec.get("concepts", sec.get("points", [])),
            "types": sec["types"],
            "examples": [
                {"q": e["q"], "a": e.get("a", ""), "analysis": e.get("analysis", "")}
                for e in sec["examples"]
            ],
        }
    return out


def main():
    pack_id = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PACK
    pack_path = PACKS / f"{pack_id}.json"
    if not pack_path.exists():
        sys.exit(f"找不到内容包：{pack_path}")

    pack = json.loads(pack_path.read_text(encoding="utf-8"))
    template = (SRC / "template.html").read_text(encoding="utf-8")
    css = ((SRC / "script-font.css").read_text(encoding="utf-8")
           + "\n"
           + (SRC / "style.css").read_text(encoding="utf-8"))
    app = (SRC / "app.js").read_text(encoding="utf-8")

    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
    content_js = (
        "const BOOK = " + dump(pack["book"]) + ";\n"
        "const NOTES = " + dump(public_notes(pack["notes"])) + ";\n"
    )

    html = (template
            .replace("{{PACK_NAME}}", pack["name"])
            .replace("{{STYLE}}", css)
            .replace("{{SCRIPT}}", content_js + app))

    out = ROOT / "index.html"
    out.write_text(html, encoding="utf-8")

    sections = sum(len(c["sections"]) for c in pack["book"]["chapters"])
    print(f"构建完成 {out.name}  {len(html.encode('utf-8')):,} 字节  "
          f"包={pack_id}（{pack['name']}，{len(pack['notes'])}/{sections} 节有内容）")

    for m in MIRRORS:
        if m.exists():
            shutil.copyfile(out, m)
            print(f"  已同步 {m}")


if __name__ == "__main__":
    main()
