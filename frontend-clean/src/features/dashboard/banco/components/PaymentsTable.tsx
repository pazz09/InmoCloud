import { payment_view_t } from "@/types";
import { useEffect, useState } from "react";
import { Table, Form, Button, Row, Col, Card } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type PaymentsTableProps = {
  payments: payment_view_t[];
};

const format = new Intl.DateTimeFormat("es-CL");

const formatDate = (date: Date) => {
  return format.format(date);
};

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
    "Acciones",
  ]

  useEffect(() => {
    console.log("Pagos: ", props.payments);
  }, [props.payments]);

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.text("Listado de Pagos", 14, 15);

    // Convertir datos a tabla
    const data = props.payments.map((p) => [
      formatDate(p.timestamp),
      p.id,
      p.categoria,
      p.cliente,
      p.propiedad,
      p.detalle,
      p.deposito,
      p.giro,
    ]);

    // Generar tabla
    autoTable(doc, {
      head: [fields.slice(0, -1)], // Excluye "Acciones"
      body: data,
      startY: 20,
    });

    // Guardar PDF
    doc.save("pagos.pdf");
  };

  return (
    <>
    {/* Botón exportar PDF */}
      <div className="mb-3 text-end">
        <Button variant="outline-danger" onClick={handleExportPDF}>
          Exportar a PDF
        </Button>
      </div>



      {/* Tabla estilizada */}
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
            {props.payments.map((payment: payment_view_t) => (
              <tr key={payment.id}>
                <td>{formatDate(payment.timestamp)}</td>
                <td>{payment.id}</td>
                <td>{payment.categoria}</td>
                <td>{payment.cliente}</td>
                <td>{payment.propiedad}</td>
                <td>{payment.detalle}</td>
                <td>{payment.deposito}</td>
                <td>{payment.giro}</td>
                <td>
                  <Button size="sm" variant="outline-primary">
                    Ver
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

