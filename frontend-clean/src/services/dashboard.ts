import { dashboard_response_schema } from '@/types';
import { AppError } from '@/utils/errors';

export async function fetchDashboardData(token: string) {
  const res = await fetch('/api/dashboard', {
    headers: { authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new AppError('Unauthorized or failed request', res.status);
  }

  const json = await res.json();
  const parsed = dashboard_response_schema.safeParse(json);

  if (!parsed.success || !parsed.data.data) {
    throw new AppError("", 0, "Respuesta inválida del servidor");
  }

  return parsed.data.data;
}
