// components/UserSearchBar.tsx
import { Form, Row, Col, Button } from "react-bootstrap";
import { rolePriority, user_search_t, UserRoleEnum } from "@/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatRutInput } from "@/utils/rut";

type Props = {
  onSearch: (params: user_search_t) => void;
};

export default function UserSearchBar({ onSearch }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRoleEnum | "">("");
  const [availableRoles, setAvailableRoles] = useState<UserRoleEnum[]>([]);
  const [rut, setRUT] = useState("");
  const { role: userRole } = useAuth();

  useEffect(() => {
      // Only allow roles with lower or equal priority than the current user's role
      let roles = Object.values(UserRoleEnum).filter(
          (r) => rolePriority[r as keyof typeof rolePriority] < rolePriority[userRole]
      );
      // console.log("Available roles based on user role:", roles);
      roles = roles.filter((r) => r !== UserRoleEnum.SIN_SESION); // Exclude SIN_SESION
      setAvailableRoles(roles);
  }, [userRole]);
    // ...existing code...




  const handleSearch = () => {
    onSearch({
      nombre: name.trim() || undefined,
      role: role || undefined,
      rut: rut.trim() || undefined,
    });
  };

  return (
    <Form className="mb-3">
  <Row className="justify-content-end align-items-end g-2">
    <Col xs="auto">
      <Form.Group controlId="name">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Group>
    </Col>
    <Col xs="auto">
      <Form.Group controlId="name">
        <Form.Label>RUT</Form.Label>
        <Form.Control
          value={rut}
          onChange={(e) => setRUT(formatRutInput(e.target.value))}
        />
      </Form.Group>
    </Col>
    <Col xs="auto">
      <Form.Group controlId="role">
        <Form.Label>Rol</Form.Label>
        <Form.Select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRoleEnum | "")}
        >
          <option value="">Todos</option>
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </Col>
    <Col xs="auto" className="d-flex align-items-end">
      <Button onClick={handleSearch}>🔎 Buscar</Button>
    </Col>
  </Row>
</Form>
  );
}
