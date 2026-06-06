const API_URL = 'http://localhost:3001/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('vb_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    if (json.details && Array.isArray(json.details)) {
      const fieldErrors = json.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
      throw new Error(`Validation failed: ${fieldErrors}`);
    }
    const error = json.message || json.error || 'Something went wrong';
    throw new Error(error);
  }

  // Assuming the backend always returns { success: true, data: ... }
  return json.data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
