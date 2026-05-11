export function optionalEnv(name: string, fallback = '') {
  return process.env[name] ?? fallback;
}

export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`${name} 환경 변수가 필요합니다.`);
  }
  return value;
}

export function frontendUrl() {
  return optionalEnv('FRONTEND_URL', 'http://localhost:5173').replace(/\/$/, '');
}

export function backendUrl(req: any) {
  const configured = optionalEnv('BACKEND_URL');
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  const host = req.headers.host;
  const proto = req.headers['x-forwarded-proto'] ?? 'https';
  return `${proto}://${host}`;
}

export function isProduction() {
  return process.env.NODE_ENV === 'production' || optionalEnv('VERCEL') === '1';
}
