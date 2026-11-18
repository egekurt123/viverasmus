/** Photos are stored by the Spring Boot API; listing data keeps these URLs as references. */
const PHOTOS_API = '/api/photos';

interface PhotoUploadResponse { id: string; url: string; }

/** Uploads a photo and returns its persistent URL. */
export async function saveImage(file: File, propertyName: string, roomNumber?: number): Promise<string> {
  const body = new FormData();
  body.append('file', await shrink(file), 'photo.jpg');
  body.append('propertyName', propertyName);
  if (roomNumber !== undefined) body.append('roomNumber', String(roomNumber));
  let response: Response;
  try {
    response = await fetch(PHOTOS_API, { method: 'POST', body });
  } catch {
    throw new Error('Could not reach the photo API. Start the Spring Boot backend and try again.');
  }
  if (!response.ok) {
    throw new Error(`Photo API rejected the upload (HTTP ${response.status}).`);
  }
  const photo = await response.json() as PhotoUploadResponse;
  return photo.url;
}

/** Resize large phone photos in the browser before sending them to the API. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not read image')), 'image/jpeg', 0.82));
}

/** Backend photo URLs can be used directly in image elements. */
export async function resolveImage(ref: string): Promise<string | null> {
  return ref || null;
}

/** Removes photos when an upload is discarded or a custom listing is deleted. */
export async function deleteImages(refs: string[]): Promise<void> {
  const urls = [...new Set(refs.filter(ref => ref.startsWith(`${PHOTOS_API}/`)))];
  const results = await Promise.all(urls.map(url => fetch(url, { method: 'DELETE' })));
  if (results.some(response => !response.ok)) throw new Error('One or more photos could not be deleted.');
}
