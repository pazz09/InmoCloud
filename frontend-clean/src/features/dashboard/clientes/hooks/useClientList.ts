'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { client_list_t } from '@/types';
import { fetchClientList, ClientSearchFilters } from '@/services/clients';

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
        const data = await fetchClientList(token, filters);
        setUsers(data);
      } catch (err: unknown) {
        const message = (err as Error).message || 'Error inesperado.';
        if (message === 'No autorizado') router.push('/login');
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [token, router]
  );

  useEffect(() => {
    const _token = localStorage.getItem("token");
    setToken(_token);
    if (_token) fetchClients();
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
