const SUPABASE_URL = "https://ipuvkobuxujnhutyvvgl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_jaxwMzdGBPL02F9AcENSSA_ec2sc82I";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("Supabase Loaded:", supabaseClient);