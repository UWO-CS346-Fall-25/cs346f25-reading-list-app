/**
 * Database Connection
 *
 * This file sets up the Supabase connection.
 * The pool manages multiple database connections efficiently.
 */
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL || "https://qpzdormedkxwfughxlzs.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwemRvcm1lZGt4d2Z1Z2h4bHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjI1ODcsImV4cCI6MjA3NjQ5ODU4N30.CMtVZGaTp2QQAE1iUPsHwx-pNYxDqVACszCVsuSFT7s";
export const supabase = createClient(supabaseUrl, supabaseKey);
