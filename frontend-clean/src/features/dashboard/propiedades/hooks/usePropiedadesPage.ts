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
