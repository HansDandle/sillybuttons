const SUPABASE_URL = 'https://ozpwwxbfmgxbitbzhsae.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_KEY not set');
}

if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD not set');
}

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
    // Use Supabase REST API directly
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/custom_links`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ label, url, type })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save link to database', details: error });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error('Error adding link:', e.message);
    return res.status(500).json({ error: 'Server error', details: e.message });
  }
};
