import { useState } from "react";
import { Table, Button } from "react-bootstrap";
import {
  arrendatario_t,
  client_union_t,
  user_union_t,
  UserRoleEnum,
} from "@/backend/types";

interface ClientTableProps {
  users: client_union_t[];
  onEdit: (user: client_union_t) => void;
  onDelete: (user: client_union_t) => void;
  onAdd: () => void;
}

type SortKey = "id" | "nombre" | "role" | "canon" | "ficha_propiedad";
type SortDirection = "asc" | "desc";

export default function ClientTable({ users, onEdit, onDelete, onAdd }: ClientTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const isArrendatario = (role: UserRoleEnum) => role === UserRoleEnum.ARRENDATARIO;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

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
          </tr>
        </thead>
        <tbody>
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">
                No hay usuarios registrados
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
