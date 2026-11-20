import calculus from "../packs/calculus.json";
import cet4 from "../packs/cet4.json";
import type { Pack } from "./types";

const RAW = [calculus, cet4] as unknown as Pack[];

export const PACKS: Pack[] = RAW.map((p) => ({
  ...p,
  mode: (p.mode ?? "course") as Pack["mode"],
}));

export const packById = (id: string) => PACKS.find((p) => p.id === id) ?? PACKS[0];

/** 内容指纹：与构建脚本一致，用来判断本地快照是否过期 */
export async function contentFingerprint(): Promise<string> {
  const text = JSON.stringify(PACKS);
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].slice(0, 4).map((b) => b.toString(16).padStart(2, "0")).join("");
}
