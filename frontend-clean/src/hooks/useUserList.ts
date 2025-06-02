'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { users_list_t, users_list_schema, user_form_data } from '@/backend/types';

export function useUserList() {

  const [users, setUsers] = useState<users_list_t | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string| null> (null);
  const router = useRouter();

  const fetchUsers = useCallback(
    async (searchParams: Record<string, string> = {}) => {
      console.log("fetching users");
      if (!token) 
        return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/users/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(searchParams),
        });

        if (!res.ok) {
          console.log(res.json());
          setError('No autorizado');
          router.push('/login');
          return;
        }

        const json = await res.json();
        console.log("yeison", json);
        const parsed = users_list_schema.safeParse(json);

        if (!parsed.success) {
          console.error(parsed.error);
          setError('Error al validar los datos de usuarios.');
          return;
        }

        setUsers(parsed.data);
      } catch (err: unknown) {
        setError((err as Error).message || 'Error inesperado.');
      } finally {
        setLoading(false);
      }
    },
    [token, router]
  );

  useEffect(() => {
    console.log("useUserList");
    const _token = localStorage.getItem("token");
    setToken(_token);
    fetchUsers(); // Initial load without filters
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refresh: () => fetchUsers(),         // No search params
    searchUsers: fetchUsers,             // Accepts { name, email, etc. }
    setUsers,
  };
}
