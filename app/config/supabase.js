import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Bu bilgileri kendi Supabase projenizden almalısınız
// Dashboard > Settings > API bölümünden alın
const supabaseUrl = 'https://zerhpwvdnajcsqiyanop.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inplcmhwd3ZkbmFqY3NxaXlhbm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzQ2OTcsImV4cCI6MjA2OTgxMDY5N30.n_2eXxGoY-Dtu96jOfqdCNt7VCQn6CjDGKE0s5nkth0';

// Eğer environment variables kullanmak isterseniz:
// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
