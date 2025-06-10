import { Table, Button } from "react-bootstrap";
import { user_union_t } from "@/types";

interface UserTableProps {
  users: user_union_t[];
  onEdit: (user: user_union_t) => void;
  onDelete: (user: user_union_t) => void;
  onAdd: () => void;
}

export default function UserTable({ users, onEdit, onDelete, onAdd }: UserTableProps) {
  return (
    <>
      <div className="text-end mb-3">
        <Button variant="success" onClick={onAdd}>
          Agregar Usuario
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">
                No hay usuarios registrados
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{`${user.nombre} ${user.apellidos}`}</td>
                <td>{user.role}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(user)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(user)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
