const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ozpwwxbfmgxbitbzhsae.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SUPABASE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY environment variable is not set');
}

if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD environment variable is not set');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password, label, url, type } = req.body;

  // Verify password
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate input
  if (!label || !url || !type) {
    return res.status(400).json({ error: 'Missing required fields: label, url, type' });
  }

  if (!['button', 'treasure'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be "button" or "treasure"' });
  }

  try {
    // Insert into Supabase
    const { data, error } = await supabase
      .from('custom_links')
      .insert([{ label, url, type }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save link to database', details: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error('Error adding link:', e);
    return res.status(500).json({ error: 'Server error', details: e.message });
  }
};
