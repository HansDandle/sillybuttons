const SUPABASE_URL = 'https://ozpwwxbfmgxbitbzhsae.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password, linkId } = req.body;

  // Verify password
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!linkId) {
    return res.status(400).json({ error: 'linkId is required' });
  }

  try {
    // Delete from Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/custom_links?id=eq.${linkId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase delete error:', error);
      return res.status(500).json({ error: 'Failed to delete link', details: error });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Error deleting link:', e.message);
    return res.status(500).json({ error: 'Server error', details: e.message });
  }
};
