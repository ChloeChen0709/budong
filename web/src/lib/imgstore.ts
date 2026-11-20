/** 图片放 IndexedDB：配额按硬盘剩余算，远大于 localStorage 的 5MB */
const DB = "budong-img";
const STORE = "img";

let dbp: Promise<IDBDatabase | null> | null = null;

function open(): Promise<IDBDatabase | null> {
  if (dbp) return dbp;
  dbp = new Promise((res) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => res(req.result);
      req.onerror = () => res(null);
      req.onblocked = () => res(null);
    } catch {
      res(null);
    }
  });
  return dbp;
}

export async function putImage(key: string, dataUrl: string): Promise<boolean> {
  const db = await open();
  if (!db) return false;
  return new Promise((res) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(dataUrl, key);
      tx.oncomplete = () => res(true);
      tx.onerror = () => res(false);
    } catch {
      res(false);
    }
  });
}

export async function getImage(key: string): Promise<string | null> {
  const db = await open();
  if (!db) return null;
  return new Promise((res) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const q = tx.objectStore(STORE).get(key);
      q.onsuccess = () => res((q.result as string) ?? null);
      q.onerror = () => res(null);
    } catch {
      res(null);
    }
  });
}

export async function delImage(key: string): Promise<void> {
  const db = await open();
  if (!db) return;
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
  } catch {
    /* 忽略 */
  }
}

export const newImgKey = () => `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
