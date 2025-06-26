import { property_view_t } from "@/types";
import { Table, Button, ButtonGroup } from "react-bootstrap";

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
              <td>
                <ButtonGroup size="sm">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => onView(propiedad)}
                    title="Ver detalles"
                  >
                    Ver
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => onEdit(propiedad)}
                    title="Editar propiedad"
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    onClick={() => onDelete(propiedad)}
                    title="Eliminar propiedad"
                  >
                    Eliminar
                  </Button>
                  <Button 
                    variant="outline-info" 
                    onClick={() => onArrendatario(propiedad)}
                    title="Asignar arrendatario"
                  >
                    Arriendo
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};