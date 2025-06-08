import { payment_view_t } from "@/types";
import { useEffect } from "react";
import { Table } from "react-bootstrap";

export type PaymentsTableProps = {
  payments: payment_view_t[],
};

const format = new Intl.DateTimeFormat("es-CL");
  
const formatDate = (date: Date) => {
  return format.format(date);
}


export const PaymentsTable = (props: PaymentsTableProps) => {
  const fields = [
    "Fecha",
    "ID",
    "Categoría",
    "Cliente",
    "Propiedad",
    "Detalle",
    "Depósito",
    "Giro",
    "Acciones"
  ];
  useEffect(()=> {
    console.log("Pagos: ", props.payments);
  }, [props.payments])

  return (
<>
<Table>
  <thead>
    <tr>
      {fields.map((field, id) => (<th key={id}>{field}</th>))}
    </tr>
  </thead>
  <tbody>
    {props.payments.map((payment: payment_view_t, ) => (
      <tr key={payment.id}>
        {/* Fecha */}
        <td>{formatDate(payment.timestamp)}</td>
        {/* ID */}
        <td>{payment.id}</td>
        {/* Categoría */}
        <td>{payment.categoria}</td>
        {/* Cliente */}
        <td>{payment.cliente}</td>
        {/* Propiedad */}
        <td>{payment.propiedad}</td>
        {/* Detalle */}
        <td>{payment.detalle}</td>
        {/* Depósito */}
        <td>{payment.deposito}</td>
        {/* Giro */}
        <td>{payment.giro}</td>
        {/* Acciones */}
        <td></td>

      </tr>
    ))}
  </tbody>
  
</Table>

</>);
}
