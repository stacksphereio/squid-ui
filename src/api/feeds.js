// feeds.js - API client for Squid Feeds service

/**
 * Get feeds for the authenticated user
 * @returns {Promise<Object>} Feed response with weather and news
 */
export async function getFeed() {
  const token = localStorage.getItem('squid.token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const res = await fetch('/api/squid-feeds/feeds', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch feed: ${res.status} ${errorText}`);
  }

  return res.json();
}
