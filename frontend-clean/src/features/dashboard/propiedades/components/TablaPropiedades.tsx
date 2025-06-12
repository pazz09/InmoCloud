import { property_view_t } from "@/types";
import { Table } from "react-bootstrap";

const fields = [
  "Folio",
  "Ficha Propiedad",
  "Propietario",
  "Arrendatario",
  "Canon",
  "Deuda Saldo",
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
    {props.propiedades.map( (propiedad) => (
      <tr>
        <td>{propiedad.id}</td>
        <td>{propiedad.direccion}</td>
        <td>{propiedad.propietario}</td>
        <td>{propiedad.arrendatario}</td>
        <td>${propiedad.valor}</td>
        <td></td>
      </tr>
    ))}
  </tbody>
</Table>

</>)
}
