import { payment_search_params_t } from "@/types";
import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

type PaymentsSearchParams = payment_search_params_t;

type Props = {
  onSearch: (params: PaymentsSearchParams) => void;
};

export default function PaymentsSearchbar({onSearch}: Props) {
  const [searchParams, setSearchParams] = useState<PaymentsSearchParams>({})
  return (
    <>
    <Form className="">
      <Row className="justify-content-end align-items-end g-2">

        <Col xs="auto">
          <Form.Group controlId = "property_name">
            <Form.Label>Dirección</Form.Label>
            <Form.Control 
            value = {searchParams.propiedad! || ""}
            onChange = {(e) => {setSearchParams({...searchParams, propiedad: e.target.value !== "" ? e.target.value : undefined})}}
            >
            </Form.Control>

          </Form.Group>
        </Col>

        <Col xs="auto">
            <Form.Group controlId = "user_name">
              <Form.Label>Nombre cliente</Form.Label>
              <Form.Control 
            value = {searchParams.cliente! || ""}
            onChange = {(e) => {setSearchParams({...searchParams, cliente: e.target.value !== "" ? e.target.value : undefined })}}
              >
              </Form.Control>

            </Form.Group>
        </Col>

        <Col xs="auto" className="d-flex align-items-end">
          <Button onClick={() => onSearch(searchParams)}>🔎 Buscar</Button>
        </Col>

      </Row>
      
    </Form>
    </>
  );

}
