import { Table, Button, ButtonGroup } from "react-bootstrap";

const fields = [
  "Fecha",
  "Acciones"
];

export const TablaReportes = () => {
  return (
    <>
      <div className="mb-3 text-end">
        <Button variant="success">
          Exportar
        </Button>
      </div>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {fields.map((field, index) => (
              <th key={index}>{field}</th>
            ))}
          </tr>
        </thead>
      </Table>
    </>
  );
};