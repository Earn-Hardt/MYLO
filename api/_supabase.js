const { createClient } = require('@supabase/supabase-js');

// SUPABASE_URL and SUPABASE_SERVICE_KEY are set as Environment Variables
// in your Vercel project settings — never hardcoded here.
function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  }
  return createClient(url, key);
}

module.exports = { getClient };
