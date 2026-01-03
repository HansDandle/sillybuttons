// Supabase configuration
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://Your-URL.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'sb_publishable_UFlEyPnpOTYr9zEqiQiqjA_UEBHHmLL';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Admin password verification (call from Supabase)
export async function verifyAdminPassword(password) {
    const { data, error } = await supabase
        .from('admin_settings')
        .select('password_hash')
        .single();
    
    if (error || !data) return false;
    
    // Simple comparison - in production use bcrypt
    return password === data.password_hash;
}

// Load custom links from Supabase
export async function loadCustomLinks() {
    const { data, error } = await supabase
        .from('custom_links')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error loading links:', error);
        return [];
    }
    return data || [];
}

// Add custom link to Supabase
export async function addCustomLink(label, url, type) {
    const { error } = await supabase
        .from('custom_links')
        .insert([{ label, url, type }]);
    
    if (error) {
        console.error('Error adding link:', error);
        return false;
    }
    return true;
}

// Delete custom link
export async function deleteCustomLink(id) {
    const { error } = await supabase
        .from('custom_links')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting link:', error);
        return false;
    }
    return true;
}
