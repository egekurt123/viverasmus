/**
 * Photos uploaded by the office, kept in this browser's IndexedDB.
 * Listings refer to them as 'idb:<id>'; resolve() turns that into a displayable URL.
 */
const DB_NAME = 'viverasmus-images';
const STORE = 'images';
const MAX_SIDE = 1600;

const IMAGE_REF_PREFIX = 'idb:';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Scale a photo down so large phone pictures don't fill up the browser storage. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not read image')), 'image/jpeg', 0.82));
}

/** Stores the photo and returns its reference ('idb:<id>'). */
export async function saveImage(file: File): Promise<string> {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const blob = await shrink(file);
  await run('readwrite', store => store.put(blob, id));
  return IMAGE_REF_PREFIX + id;
}

/** Turns a stored reference into an object URL; other URLs are returned unchanged. */
export async function resolveImage(ref: string): Promise<string | null> {
  if (!ref.startsWith(IMAGE_REF_PREFIX)) return ref;
  const blob = await run<Blob | undefined>('readonly', store => store.get(ref.slice(IMAGE_REF_PREFIX.length)));
  return blob ? URL.createObjectURL(blob) : null;
}

export async function deleteImages(refs: string[]): Promise<void> {
  for (const ref of refs.filter(item => item.startsWith(IMAGE_REF_PREFIX))) {
    await run('readwrite', store => store.delete(ref.slice(IMAGE_REF_PREFIX.length)));
  }
}
