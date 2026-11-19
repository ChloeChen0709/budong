// 把仓库根目录的 packs/*.json 同步进 src/packs，供 TS 直接 import。
import { readdir, copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const from = join(here, "..", "..", "packs");
const to = join(here, "..", "src", "packs");

await mkdir(to, { recursive: true });
const files = (await readdir(from)).filter((f) => f.endsWith(".json"));
await Promise.all(files.map((f) => copyFile(join(from, f), join(to, f))));
console.log(`packs: 已同步 ${files.length} 个`);
