import { createClient } from '@supabase/supabase-js';

// Singleton pattern implementation for Supabase client
class SupabaseClient {
  private static instance: ReturnType<typeof createClient>;

  private constructor() {}

  public static getInstance(): ReturnType<typeof createClient> {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
    }
    return SupabaseClient.instance;
  }
}

export const supabase = SupabaseClient.getInstance();