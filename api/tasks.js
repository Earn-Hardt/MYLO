const { getClient } = require('./_supabase');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
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
        .from('tasks')
        .select('*')
        .eq('device_id', deviceId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ tasks: data });
    }

    if (req.method === 'POST') {
      const { title, priority, date, time } = req.body;
      if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' });
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          device_id: deviceId,
          title: title.trim(),
          priority: priority || 'medium',
          date: date || null,
          time: time || null,
          done: false
        }])
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ task: data });
    }

    if (req.method === 'PATCH') {
      const { id, done } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await supabase
        .from('tasks')
        .update({ done: !!done })
        .eq('id', id)
        .eq('device_id', deviceId)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ task: data });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('device_id', deviceId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unknown server error' });
  }
};
