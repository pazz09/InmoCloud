'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { users_list_t, users_list_schema, user_form_data, response_schema } from '@/types';
import { AppError } from "@/utils/errors"

import { fetchUsers } from "@/services/user"
export function useUserList() {

  const [users, setUsers] = useState<users_list_t | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string| null> (null);
  const router = useRouter();

  const update = useCallback(
    async (searchParams: Record<string, string> = {}) => {
      console.log("fetching users");
      if (!token) 
        return;

      setLoading(true);
      setError(null);

      try {
        const users = await fetchUsers(token, searchParams);
        setUsers(users);
      } catch(e) {
        console.log(e)
        if (e instanceof AppError && e.code === "UNAUTHORIZED")
          router.push("/login");
      }
    },
    [token, router]
  );

  useEffect(() => {
    // console.log("src/hooks/useUserList");
    const _token = localStorage.getItem("token");
    setToken(_token);
    update(); // Initial load without filters
  }, [update]);

  return {
    users,
    loading,
    error,
    refresh: async () => setUsers(await fetchUsers(token!, {})),         // No search params
    searchUsers: fetchUsers,             // Accepts { name, email, etc. }
    setUsers,
  };
}
