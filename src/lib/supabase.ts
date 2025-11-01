import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client even if env vars are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables, creating fallback client');
    // Create a mock client that will always fail gracefully
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createClient(supabaseUrl, supabaseKey);
};

export const supabase = createSupabaseClient();

// Types pour TypeScript
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          full_name?: string | null;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          company_id: string;
          code_client: string;
          name: string;
          email: string | null;
          phone: string | null;
          billing_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          code_client: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          billing_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          code_client?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          billing_address?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          company_id: string | null;
          user_id: string | null;
          user_name: string | null;
          action: string;
          module: string;
          entity_id: string | null;
          entity_type: string | null;
          details: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          user_id?: string | null;
          user_name?: string | null;
          action: string;
          module: string;
          entity_id?: string | null;
          entity_type?: string | null;
          details?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          user_id?: string | null;
          user_name?: string | null;
          action?: string;
          module?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          details?: string | null;
          created_at?: string | null;
        };
      };
    };
  };
};