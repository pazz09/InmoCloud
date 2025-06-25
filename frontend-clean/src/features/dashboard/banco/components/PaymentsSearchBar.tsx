import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";

type PaymentsSearchParams = {
    property_name?: string,
    date?: Date,
    paid?: boolean,
}

type Props = {
  onSearch: (params: PaymentsSearchParams) => void;
};

export default function PaymentsSearchbar() {
  const [searchParams, setSearchParams] = useState<PaymentsSearchParams>({})
  return (
    <>
    <Form className="mb-3">
      <Row className="justify-content-end align-items-end g-2">
        <Col xs="auto">
          <Form.Group controlId = "name">
            <Form.Label>Nombre propiedad</Form.Label>
            <Form.Control 
              value= {searchParams.property_name}
              onChange={(e) => setSearchParams({...searchParams, property_name: e.target.value})}
            >
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      
    </Form>
    </>
  );

}
