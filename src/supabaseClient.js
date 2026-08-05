import { createClient } from '@supabase/supabase-js';

// Substitui com os dados reais do teu projeto no Supabase (Project Settings -> API)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pcigqjqhwtclyzoztyie.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjaWdxanFod3RjbHl6b3p0eWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTY1MTcsImV4cCI6MjEwMDgzMjUxN30.rzMkw8d9SWzWNSsY6B-CzdK89KESrAK7-O3jEkYzvbo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);