const SUPABASE_URL = "https://nnxluufserwjnofnvyuy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueGx1dWZzZXJ3am5vZm52eXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4Mjc2MDMsImV4cCI6MjExMDQwMzYwM30.-Osym13BgrHUzuMzxAyH3wRZjer8nbN4S4njhjd7br0";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: returns current logged-in user id or null
async function getCurrentUserId() {
	try {
		const resp = await supabaseClient.auth.getUser();
		return resp?.data?.user?.id || null;
	} catch (e) {
		console.warn('Failed to read current user id', e);
		return null;
	}
}

// Debug helper: logs user/session/token info to console (safe for short-term debugging)
async function getAuthDebug() {
	try {
		const userResp = await supabaseClient.auth.getUser();
		const sessionResp = await supabaseClient.auth.getSession();
		const user = userResp?.data?.user || null;
		const accessToken = sessionResp?.data?.session?.access_token || null;
		return { user, accessToken };
	} catch (e) {
		console.warn('getAuthDebug failed', e);
		return { user: null, accessToken: null };
	}
}

// Export debug helpers to global for ease of running in phone console
window.__supabase_debug = {
	getCurrentUserId,
	getAuthDebug
};

