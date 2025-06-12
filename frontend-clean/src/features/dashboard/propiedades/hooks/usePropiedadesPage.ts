import { fetchProperties } from "@/services/properties"
import { property_view_t } from "@/types"
import { useEffect, useState } from "react"

type PropiedadesPageProvides = {
  propiedades: property_view_t[],
}
export function usePropiedadesPage(): PropiedadesPageProvides {
  const [properties, setProperties] = useState<property_view_t[]>([]);
  useEffect(() => {
    const fn = async () => {
       const token = localStorage.getItem("token");
      if (!token) return;
      setProperties(await fetchProperties(token, {}));
    }
    fn();
  },[])

  return { propiedades: properties }
}
