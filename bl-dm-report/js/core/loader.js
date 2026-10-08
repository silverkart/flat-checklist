import { CDN } from '../config.js';

// Lazy, memoised loaders for CDN libraries. Each resolves once and is reused.
const cache = new Map();
const once = (key, fn) => {
  if (!cache.has(key)) cache.set(key, fn().catch((e) => { cache.delete(key); throw e; }));
  return cache.get(key);
};

export const loadSupabase = () => once('supabase', () => import(CDN.supabase));
export const loadXLSX = () => once('xlsx', () => import(CDN.xlsx));
export const loadPdfJs = () => once('pdfjs', async () => {
  const pdfjs = await import(CDN.pdfjs);
  pdfjs.GlobalWorkerOptions.workerSrc = CDN.pdfjsWorker;
  return pdfjs;
});
