const API_URL = '/api';

export const apiFetch = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const authService = {
  login: (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  me: () => apiFetch('/auth/me'),
};

export const eventService = {
  getAll: (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/events?${query}`);
  },
  getById: (id: string) => apiFetch(`/events/${id}`),
  create: (data: any) => apiFetch('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/events/${id}`, { method: 'DELETE' }),
  getMyEvents: () => apiFetch('/events/organizer/my-events'),
};

export const registrationService = {
  register: (eventId: string) => apiFetch('/registrations', { method: 'POST', body: JSON.stringify({ eventId }) }),
  getMyRegistrations: () => apiFetch('/registrations/my'),
  getEventRegistrations: (eventId: string) => apiFetch(`/registrations/event/${eventId}`),
  cancel: (id: string) => apiFetch(`/registrations/${id}`, { method: 'DELETE' }),
};

export const userService = {
  getAll: () => apiFetch('/users'),
  getStats: () => apiFetch('/users/stats'),
  updateStatus: (id: string, status: string) => apiFetch(`/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  delete: (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};
