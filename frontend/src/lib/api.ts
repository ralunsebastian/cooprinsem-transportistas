import { useAuthStore } from '@/stores/auth';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body) headers.set('Content-Type', 'application/json');

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
    throw new ApiError(401, 'Sesión expirada');
  }

  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const body = await res.json();
      mensaje = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? mensaje);
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(res.status, mensaje);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
