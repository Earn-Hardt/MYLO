const { getClient } = require('./_supabase');

// Stores small per-device state (streak count/last-day, step count) as a
// single row per device — simpler than its own table per field.
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let supabase;
  try {
    supabase = getClient();
  } catch (e) {
    return res.status(500).json({ error: 'Server not configured: ' + e.message });
  }

  const deviceId = (req.query.device_id || (req.body && req.body.device_id) || '').toString();
  if (!deviceId) return res.status(400).json({ error: 'device_id is required' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('device_state')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();
      if (error) throw error;
      return res.status(200).json({
        state: data || {
          device_id: deviceId,
          streak_count: 0,
          streak_last: '',
          steps: 0,
          steps_date: ''
        }
      });
    }

    if (req.method === 'POST') {
      const { streak_count, streak_last, steps, steps_date } = req.body;
      const payload = { device_id: deviceId };
      if (streak_count !== undefined) payload.streak_count = streak_count;
      if (streak_last !== undefined) payload.streak_last = streak_last;
      if (steps !== undefined) payload.steps = steps;
      if (steps_date !== undefined) payload.steps_date = steps_date;

      const { data, error } = await supabase
        .from('device_state')
        .upsert(payload, { onConflict: 'device_id' })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ state: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unknown server error' });
  }
};
