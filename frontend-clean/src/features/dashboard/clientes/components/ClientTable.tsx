import { useState } from "react";
import { Table, Button } from "react-bootstrap";
import {
  arrendatario_t,
  client_union_t,
  UserRoleEnum,
} from "@/types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

interface ClientTableProps {
  users: client_union_t[];
  onEdit: (user: client_union_t) => void;
  onDelete: (user: client_union_t) => void;
  onView: (user: client_union_t) => void;
  onAdd: () => void;
}


type SortKey = "id" | "nombre" | "role" | "canon" | "ficha_propiedad";
type SortDirection = "asc" | "desc";

export default function ClientTable({ users, onEdit, onDelete, onAdd, onView }: ClientTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchText, setSearchText] = useState("");
  const [searchRole, setSearchRole] = useState<"" | "A" | "P">("");

  const isArrendatario = (role: UserRoleEnum) => role === UserRoleEnum.ARRENDATARIO;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.nombre} ${user.apellidos}`.toLowerCase();
    const role = isArrendatario(user.role) ? "A" : "P";
    return (
      fullName.includes(searchText.toLowerCase()) &&
      (searchRole === "" || role === searchRole)
    );
  });

  const sortedUsers = [...users].sort((a, b) => {
    const getValue = (user: client_union_t) => {
      switch (sortKey) {
        case "id":
          return user.id;
        case "nombre":
          return `${user.nombre} ${user.apellidos}`.toLowerCase();
        case "role":
          return isArrendatario(user.role) ? "A" : "P";
        case "canon":
          return isArrendatario(user.role) && (user as arrendatario_t).propiedad
            ? (user as arrendatario_t).propiedad!.valor
            : 0;
        case "ficha_propiedad":
          return isArrendatario(user.role) && (user as arrendatario_t).propiedad
            ? `FP${(user as arrendatario_t).propiedad!.id} ${(user as arrendatario_t).propiedad!.direccion}`.toLowerCase()
            : "";

        default:
          return "";
      }
    };

    const aValue = getValue(a);
    const bValue = getValue(b);

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortDirection === "asc" ? "↑" : "↓") : "";

  return (
    <>

      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
              ID {sortIcon("id")}
            </th>
            <th onClick={() => handleSort("nombre")} style={{ cursor: "pointer" }}>
              Nombre {sortIcon("nombre")}
            </th>
            <th onClick={() => handleSort("role")} style={{ cursor: "pointer" }}>
              Rol {sortIcon("role")}
            </th>
            <th onClick={() => handleSort("ficha_propiedad")} style={{ cursor: "pointer" }}>
              Ficha propiedad {sortIcon("role")}
            </th>
            <th onClick={() => handleSort("canon")} style={{ cursor: "pointer" }}>
              Canon {sortIcon("canon")}
            </th>
            <th>Deuda/Saldo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">
                No hay usuarios para mostrar
              </td>
            </tr>
          ) : (
            sortedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{`${user.nombre} ${user.apellidos}`}</td>
                <td>{isArrendatario(user.role) ? "A" : "P"}</td>
                <td>
                  {isArrendatario(user.role) && ((user as arrendatario_t).propiedad
                    ? `FP${(user as arrendatario_t).propiedad!.id} ${(user as arrendatario_t).propiedad!.direccion}`
                    : "No asignado") || "N/A"}
                </td>
                <td>
                  {isArrendatario(user.role) && ((user as arrendatario_t).propiedad
                    ? `$${(user as arrendatario_t).propiedad!.valor.toLocaleString("es-CL")}`
                    : "No asignado") || "N/A"}
                </td>
                <td>{/* TODO: Mostrar deuda/saldo */}</td>
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

      <div className="text-end mb-3">
        <Button variant="success" onClick={onAdd}>
          + Agregar Usuario
        </Button>
      </div>
    </>
  );
}
