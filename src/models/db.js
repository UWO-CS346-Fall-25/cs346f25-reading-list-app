/**
 * Database Connection
 *
 * This file sets up the Supabase connection.
 * The pool manages multiple database connections efficiently.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
