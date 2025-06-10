import { property_view_t } from "@/types";
import { Table } from "react-bootstrap";

const fields = [
  "Folio",
  "Ficha Propiedad",
  "Propietario",
  "Arrendatario",
  "Canon",
  "Deuda Saldo",
  "Pagado",
]

type TablaPropiedadesProps = {
  propiedades: property_view_t[],
}

export const TablaPropiedades = (props: TablaPropiedadesProps) => {
  return(<>
<Table>
  <thead>
    <tr>
      {fields.map((field) => (<th>{field}</th>))}  
    </tr>
  </thead>
  <tbody>
  </tbody>
</Table>

</>)
}
