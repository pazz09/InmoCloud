// components/UserSearchBar.tsx
import { property_search_t } from "@/types";
import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

type Props = {
  onSearch: (params: property_search_t) => void;
};

export default function PropertySearchBar({ onSearch }: Props) {
  const [ownerName, setOwnerName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [address, setAddress] = useState("");

  const handleSearch = () => {
    onSearch({
      propietario: ownerName.trim() || undefined,
      arrendatario: tenantName.trim() || undefined,
      direccion: address.trim() || undefined,
    });
  };

  return (
    <Form className="mb-3">
      <Row className="justify-content-end align-items-end g-2">
        <Col xs="auto">
          <Form.Group controlId="name">
            <Form.Label>Nombre propietario</Form.Label>
            <Form.Control
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs="auto">
          <Form.Group controlId="name">
            <Form.Label>Nombre arrendatario</Form.Label>
            <Form.Control
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs="auto">
          <Form.Group controlId="name">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs="auto" className="d-flex align-items-end">
          <Button onClick={handleSearch}>🔎 Buscar</Button>
        </Col>
      </Row>
    </Form>
  );
}
