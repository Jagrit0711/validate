import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://auth.zuup.dev";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "gateway_secret_placeholder";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "jagrit@zuup.dev";

export type ValidateRow = {
  id: string;
  code: string;
  name: string;
  email: string;
  issued_for: string;
  issued_date: string;
  created_at: string;
};
