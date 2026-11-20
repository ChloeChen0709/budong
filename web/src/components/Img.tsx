import { useEffect, useState } from "react";
import { getImage } from "../lib/imgstore";

/** 从 IndexedDB 取图渲染，避免把 base64 塞进 localStorage */
export default function Img({ imgKey, className }: { imgKey: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void getImage(imgKey).then((v) => alive && setSrc(v));
    return () => {
      alive = false;
    };
  }, [imgKey]);
  if (!src) return null;
  return <img className={className} src={src} alt="" />;
}
