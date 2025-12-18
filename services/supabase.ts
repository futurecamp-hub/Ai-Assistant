
import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const SUPABASE_URL = 'https://gnlugepacavnfdhfmcvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubHVnZXBhY2F2bmZkaGZtY3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTgxNjAsImV4cCI6MjA4MTQ5NDE2MH0.3TW24iKzGPIop9rV7_rb29eWPCHsI4uGduQxG_2mArY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type DatabaseTask = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
};
