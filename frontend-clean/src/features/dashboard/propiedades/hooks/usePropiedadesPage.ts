import { fetchProperties } from "@/services/properties"
import { property_view_t } from "@/types"
import { AppError } from "@/utils/errors"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

type PropiedadesPageProvides = {
  propiedades: property_view_t[],
  refresh: () => {},
}
export function usePropiedadesPage(): PropiedadesPageProvides {
  const router = useRouter();

  const refresh = async () => {
     const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setProperties(await fetchProperties(token, {}));
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === "UNAUTHORIZED" ) {
          router.push("/login")
        }
      }
    }
  }


  const [properties, setProperties] = useState<property_view_t[]>([]);
  useEffect(() => {
    refresh();
  },[])

  return { propiedades: properties, refresh }
}
