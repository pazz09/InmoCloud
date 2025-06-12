import { fetchProperties } from "@/services/properties"
import { property_view_t } from "@/types"
import { useEffect, useState } from "react"

type PropiedadesPageProvides = {
  propiedades: property_view_t[],
  refresh: () => {},
}
export function usePropiedadesPage(): PropiedadesPageProvides {

  const refresh = async () => {
     const token = localStorage.getItem("token");
    if (!token) return;
    setProperties(await fetchProperties(token, {}));
  }


  const [properties, setProperties] = useState<property_view_t[]>([]);
  useEffect(() => {
    refresh();
  },[])

  return { propiedades: properties, refresh }
}
