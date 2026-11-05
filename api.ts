export const API_URL = '';

export async function apiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
) {
  const token = localStorage.getItem('fmf_session_token');
  const userString = localStorage.getItem('fmf_user');
  let currentUsername = 'System';
  
  if (userString) {
    try {
      const parsed = JSON.parse(userString);
      currentUsername = parsed.username || parsed.name || 'System';
    } catch (e) {
      // Ignored
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user': currentUsername,
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
