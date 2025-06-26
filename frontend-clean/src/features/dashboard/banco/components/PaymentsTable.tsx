import { payment_view_t } from "@/types";
import { formatDate } from "@/utils";
import { Table, Button } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";


export type PaymentsTableProps = {
  payments: payment_view_t[];
  onView: (payment: payment_view_t) => void;
  onEdit: (payment: payment_view_t) => void;
  onDelete: (payment: payment_view_t) => void;
  onAdd: () => void;
};


export const PaymentsTable = ({
  payments,
  onView,
  onEdit,
  onDelete,
  onAdd,
}: PaymentsTableProps) => {
  const fields = [
    "Fecha",
    "ID",
    "Categoría",
    "Cliente",
    "Propiedad",
    "Detalle",
    "Depósito",
    "Giro",
    "Pagado",
    "Acciones",
  ];

  return (
    <>
      <div className="table-responsive">
        <Table striped bordered hover className="align-middle shadow-sm">
          <thead className="table-light">
            <tr>
              {fields.map((field, id) => (
                <th key={id}>{field}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{formatDate(payment.fecha)}</td>
                <td>{payment.id}</td>
                <td>{payment.categoria}</td>
                <td>{payment.cliente}</td>
                <td>{payment.propiedad}</td>
                <td>{payment.detalle}</td>
                {/*TODO: Formatear monto (añadir función a src/utils.ts)*/}
                <td>{payment.tipo && payment.monto}</td>
                <td>{payment.tipo || payment.monto}</td>
                <td>{payment.pagado ? "Sí" : "No"}</td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => onView(payment)}
                  >
                    <FaEye />
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-1"
                    onClick={() => onEdit(payment)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(payment)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="text-end mb-3">
          <Button variant="success" onClick={onAdd}>
            + Agregar Pago
          </Button>
        </div>

      </div>
    </>
  );
};
