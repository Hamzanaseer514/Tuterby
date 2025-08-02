import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'https://yukeuzxsqrtnqmwxsuqm.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1a2V1enhzcXJ0bnFtd3hzdXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTg5NjEsImV4cCI6MjA2MzUzNDk2MX0.e-bQ-BjLlFLzEaIfBsxA0vjpHvF2wd1kQCdtKnPbst4';

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);