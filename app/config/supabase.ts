import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Bu bilgileri kendi Supabase projenizden almalısınız
// Dashboard > Settings > API bölümünden alın
const supabaseUrl = 'https://enolfzehfmzbkkxbqrle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2xmemVoZm16YmtreGJxcmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTYxMjAsImV4cCI6MjA4NDE3MjEyMH0.nov3O4W4EsxGqPYB_WzCiZbL-PndMmvlDkGnNuVVtFA';

// Eğer environment variables kullanmak isterseniz:
// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
