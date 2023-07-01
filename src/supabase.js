/**
 * @prettier
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xykswvxcnjfwzorkgonu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5a3N3dnhjbmpmd3pvcmtnb251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM1NjIzMzMsImV4cCI6MTk4OTEzODMzM30.0K8F0ItKARwNpELvm11wxF8S4EeTcHNbZzYtp8KZP18";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
