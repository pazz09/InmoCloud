import { property_view_t } from "@/types";
import { Table, Button, ButtonGroup } from "react-bootstrap";
import { FaEdit, FaEye, FaTrash, FaUser } from "react-icons/fa";

const fields = [
  "Folio",
  "Ficha Propiedad",
  "Propietario",
  "Arrendatario",
  "Canon",
  "Deuda Saldo",
  "Acciones"
];

type TablaPropiedadesProps = {
  propiedades: property_view_t[];
  onView: (property: property_view_t) => void;
  onEdit: (property: property_view_t) => void;
  onDelete: (property: property_view_t) => void;
  onArrendatario: (property: property_view_t) => void;
};

export const TablaPropiedades = ({
  propiedades,
  onView,
  onEdit,
  onDelete,
  onArrendatario
}: TablaPropiedadesProps) => {
  return (
    <>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {fields.map((field, index) => (
              <th key={index}>{field}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {propiedades.map((propiedad) => (
            <tr key={propiedad.id}>
              <td>{propiedad.id}</td>
              <td>{propiedad.direccion}</td>
              <td>{propiedad.propietario}</td>
              <td>{propiedad.arrendatario || "Sin arrendatario"}</td>
              <td>${propiedad.valor.toLocaleString()}</td>
              <td>-</td>
              <td className="text-center">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-1"
                  onClick={() => onView(propiedad)}
                >
                  <FaEye />
                </Button>

                <Button
                  variant="outline-success"
                  size="sm"
                  className="me-1"
                  onClick={() => onEdit(propiedad)}
                >
                  <FaEdit />
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  className="me-1"
                  onClick={() => onDelete(propiedad)}
                >
                  <FaTrash />
                </Button>

                <Button
                  variant="outline-info"
                  size="sm"
                  className="me-1"
                  onClick={() => onArrendatario(propiedad)}
                >
                  <FaUser />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};