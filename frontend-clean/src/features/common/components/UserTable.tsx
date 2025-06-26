import { Table, Button } from "react-bootstrap";
import { user_union_t } from "@/types";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

interface UserTableProps {
  users: user_union_t[];
  onEdit: (user: user_union_t) => void;
  onDelete: (user: user_union_t) => void;
  onView: (user: user_union_t) => void;
}

export default function UserTable({ users, onEdit, onDelete, onView }: UserTableProps) {
  return (
    <>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>RUT</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">
                No hay usuarios para mostrar
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{`${user.nombre} ${user.apellidos}`}</td>
                <td>{user.rut}</td>
                <td>{user.role}</td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => onView(user)}
                  >
                    <FaEye />
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-1"
                    onClick={() => onEdit(user)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(user)}
                  >
                    <FaTrash />
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
