import { createClient } from '@supabase/supabase-js';

type EnvConfig = {
  url: string;
  key: string;
};

declare global {
  interface Window {
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_ANON_KEY?: string;
  }
}

function resolveEnv(): EnvConfig {
  const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

  if (VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY) {
    return {
      url: VITE_SUPABASE_URL,
      key: VITE_SUPABASE_ANON_KEY,
    };
  }

  const fallbackUrl = window?.VITE_SUPABASE_URL;
  const fallbackKey = window?.VITE_SUPABASE_ANON_KEY;

  if (fallbackUrl && fallbackKey) {
    return {
      url: fallbackUrl,
      key: fallbackKey,
    };
  }

  throw new Error(
    'Supabase environment variables not found. Make sure you are running via Vite (npm run dev) or define global fallback variables.'
  );
}

const { url, key } = resolveEnv();

export const supabase = createClient(url, key);

export const invokeRootAction = async <TResponse = unknown>(
  action: string,
  payload: Record<string, unknown>
): Promise<TResponse> => {
  const { data, error } = await supabase.functions.invoke('root-action', {
    body: { action, ...payload },
  });

  if (error) throw error;
  return data as TResponse;
};
