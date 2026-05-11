interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
  });
  return readResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
  });
  return readResponse<T>(response);
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? '요청을 처리하지 못했습니다.');
  }
  return payload.data;
}
