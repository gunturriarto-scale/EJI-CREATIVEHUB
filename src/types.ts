export type ToolId = 
  | 'riset-ide'
  | 'product-photography'
  | 'virtual-try-on'
  | 'buat-model'
  | 'ubah-pose'
  | 'ubah-ekspresi'
  | 'teks-iklan'
  | 'edit-foto'
  | 'combine-text'
  | 'carousel-feed'
  | 'voice-over'
  | 'narasi-cerita'
  | 'edit-karakter';

export interface ImageData {
  base64: string;
  mimeType: string;
  dataUrl: string;
}
