import { createClient } from '@supabase/supabase-js';

// Refactored to safely handle environments where import.meta.env might be undefined
function resolveEnv() {
  // Check if running inside Vite (ESM)
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

    if (VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY) {
      return {
        url: VITE_SUPABASE_URL,
        key: VITE_SUPABASE_ANON_KEY,
      };
    }
  }

  // Fallback for non-Vite environments (like sandbox preview)
  const fallbackUrl = (window as any)?.VITE_SUPABASE_URL;
  const fallbackKey = (window as any)?.VITE_SUPABASE_ANON_KEY;

  if (fallbackUrl && fallbackKey) {
    return {
      url: fallbackUrl,
      key: fallbackKey,
    };
  }

  throw new Error(
    "Supabase environment variables not found. Make sure you are running via Vite (npm run dev) or define global fallback variables."
  );
}

const { url, key } = resolveEnv();

export const supabase = createClient(url, key);

// Helper to invoke Root Actions
export const invokeRootAction = async (action: string, payload: any) => {
  const { data, error } = await supabase.functions.invoke('root-action', {
    body: { action, ...payload }
  });
  
  if (error) throw error;
  return data;
};