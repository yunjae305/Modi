import { requiredEnv } from './env';

function supabaseUrl() {
  return requiredEnv('SUPABASE_URL').replace(/\/$/, '');
}

function serviceKey() {
  return requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
}

export function eq(value: string | number) {
  return encodeURIComponent(String(value));
}

export async function supabaseFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey(),
      Authorization: `Bearer ${serviceKey()}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase 요청 실패: ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function selectRows<T>(table: string, query = '?select=*') {
  return supabaseFetch(`${table}${query}`) as Promise<T[]>;
}

export async function selectOne<T>(table: string, query: string) {
  const rows = await selectRows<T>(table, query.includes('limit=') ? query : `${query}&limit=1`);
  return rows[0] ?? null;
}

export async function insertRow<T>(table: string, row: Record<string, unknown>) {
  const rows = await supabaseFetch(`${table}?select=*`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  }) as T[];
  return rows[0];
}

export async function patchRows<T>(table: string, query: string, row: Record<string, unknown>) {
  return supabaseFetch(`${table}${query}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  }) as Promise<T[]>;
}

export async function upsertRows<T>(table: string, rows: Record<string, unknown>[], onConflict: string) {
  return supabaseFetch(`${table}?on_conflict=${encodeURIComponent(onConflict)}&select=*`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(rows),
  }) as Promise<T[]>;
}
