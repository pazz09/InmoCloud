// services/clients.ts
import { client_list_schema, response_schema, client_list_t } from '@/types';

export type ClientSearchFilters = {
  name?: string;
  property_name?: string;
};

export async function fetchClientList(token: string, filters?: ClientSearchFilters): Promise<client_list_t> {
  const res = await fetch('/api/users/clients/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(filters || {}),
  });

  if (!res.ok) {
    throw new Error('No autorizado');
  }

  const json = await res.json();
  const parsed = response_schema(client_list_schema).safeParse(json);

  if (!parsed.success) {
    console.error(parsed.error);
    throw new Error('Error al validar los datos de usuarios.');
  }

  return parsed.data.data!;
}
