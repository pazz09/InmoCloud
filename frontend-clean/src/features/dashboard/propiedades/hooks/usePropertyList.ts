/*
import { fetchProperties } from "@/services/properties"
import { property_view_t } from "@/types"
import { AppError } from "@/utils/errors"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"

type PropiedadesPageProvides = {
  propiedades: property_view_t[],
  refresh: () => object,
}
export function usePropiedadesPage(): PropiedadesPageProvides {
  const router = useRouter();
  const [properties, setProperties] = useState<property_view_t[]>([]);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const fetched = await fetchProperties(token, {});
      setProperties(fetched);
    } catch (err) {
      if (err instanceof AppError && err.code === "UNAUTHORIZED") {
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { propiedades: properties, refresh };
}
*/

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { property_search_t, property_view_t } from '@/types';
import { fetchProperties, PropertySearchFilters } from '@/services/properties';

export function usePropertyList() {
  const [propiedades, setPropiedades] = useState<property_view_t[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const fetchPropiedades = useCallback(
    async (filters?: property_search_t) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchProperties(token, filters);
        setPropiedades(data);
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
    const _token = localStorage.getItem('token');
    setToken(_token);
    if (_token) fetchPropiedades();
  }, [fetchPropiedades]);

  return {
    propiedades,
    loading,
    error,
    refresh: () => fetchPropiedades(),
    searchProperties: (filters: property_search_t) => fetchPropiedades(filters),
    setPropiedades,
  };
}

