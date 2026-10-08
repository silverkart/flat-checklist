// App-wide constants. Change here, not in feature modules.
export const HOTEL_NAME = 'Banchory Lodge';
export const TOTAL_ROOMS = 28;
export const STORAGE_KEY = 'bl-dm-report:v1';
export const SUPABASE_CFG_KEY = 'bl-dm-report:supabase';
export const LOOKAHEAD_DAYS = 3;

export const DEFAULT_SERVICE_TYPES = ['Lunch', 'Dinner', 'Afternoon Tea', 'Funeral Tea'];
export const DEFAULT_AREAS = ['Bar', 'Dining Room', 'Lounge', 'Dee Room'];

// Third-party libraries are loaded lazily (only when a feature needs them), so the
// core app still boots offline. Pin exact versions.
export const CDN = {
  supabase: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm',
  xlsx: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm',
  pdfjs: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.min.mjs',
  pdfjsWorker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs',
};
