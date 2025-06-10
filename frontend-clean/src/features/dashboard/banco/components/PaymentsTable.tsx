import { payment_view_t } from "@/types";
import { Table, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";


export type PaymentsTableProps = {
  payments: payment_view_t[];
  onView: (payment: payment_view_t) => void;
  onEdit: (payment: payment_view_t) => void;
  onDelete: (payment: payment_view_t) => void;
};

const format = new Intl.DateTimeFormat("es-CL");

const formatDate = (date: Date) => {
  return format.format(date);
};

export const PaymentsTable = ({
  payments,
  onView,
  onEdit,
  onDelete,
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
    "Acciones",
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Listado de Pagos", 14, 15);

    const data = payments.map((p) => [
      formatDate(p.timestamp),
      p.id,
      p.categoria,
      p.cliente,
      p.propiedad,
      p.detalle,
      p.deposito,
      p.giro,
    ]);

    autoTable(doc, {
      head: [fields.slice(0, -1)], // sin "Acciones"
      body: data,
      startY: 20,
    });

    doc.save("pagos.pdf");
  };

  return (
    <>
      <div className="mb-3 text-end">
        <Button variant="outline-danger" onClick={handleExportPDF}>
          Exportar a PDF
        </Button>
      </div>

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
                <td>{formatDate(payment.timestamp)}</td>
                <td>{payment.id}</td>
                <td>{payment.categoria}</td>
                <td>{payment.cliente}</td>
                <td>{payment.propiedad}</td>
                <td>{payment.detalle}</td>
                <td>{payment.deposito}</td>
                <td>{payment.giro}</td>
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
      </div>
    </>
  );
};
