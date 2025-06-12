import { property_view_t } from "@/types"

type PropiedadesPageProvides = {
  propiedades: property_view_t,
}
export function usePropiedadesPage(): PropiedadesPageProvides {
  const propiedades: property_view_t[] = [];

  return { propiedades }

}
