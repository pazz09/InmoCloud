'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  client_list_t,
  client_list_schema,
  response_schema
} from '@/backend/types';

type ClientSearchFilters = {
  name?: string;
  property_name?: string;
};

export function useClientList() {
  const [users, setUsers] = useState<client_list_t | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const fetchClients = useCallback(
    async (filters?: ClientSearchFilters) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/users/clients/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(filters || {}),
        });

        if (!res.ok) {
          setError('No autorizado');
          router.push('/login');
          return;
        }

        const json = await res.json();
        const parsed = response_schema(client_list_schema).safeParse(json);

        if (!parsed.success) {
          console.error(parsed.error);
          setError('Error al validar los datos de usuarios.');
          return;
        }

        setUsers(parsed.data.data!);
      } catch (err: unknown) {
        setError((err as Error).message || 'Error inesperado.');
      } finally {
        setLoading(false);
      }
    },
    [token, router]
  );

  useEffect(() => {
    const _token = localStorage.getItem("token");
    setToken(_token);
    if (_token) fetchClients(); // Initial load
  }, [fetchClients]);

  return {
    users,
    loading,
    error,
    refresh: () => fetchClients(),
    searchClients: (filters: ClientSearchFilters) => fetchClients(filters),
    setUsers,
  };
}
