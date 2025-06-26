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

        <Col >
          <Form.Group controlId = "property_name">
            <Form.Label>Dirección</Form.Label>
            <Form.Control 
            value = {searchParams.propiedad! || ""}
            onChange = {(e) => {setSearchParams({...searchParams, propiedad: e.target.value !== "" ? e.target.value : undefined})}}
            >
            </Form.Control>

          </Form.Group>
        </Col>

        <Col>
            <Form.Group controlId = "user_name">
              <Form.Label>Nombre cliente</Form.Label>
              <Form.Control 
            value = {searchParams.cliente! || ""}
            onChange = {(e) => {setSearchParams({...searchParams, cliente: e.target.value !== "" ? e.target.value : undefined })}}
              >
              </Form.Control>

            </Form.Group>
        </Col>

        <Col >
            <Form.Group controlId = "monto_min">
              <Form.Label>Monto mín.</Form.Label>
              <Form.Control 
              onChange={(e) => {
                const value = e.target.value;
                const num = Number.parseInt(value);

                if (value !== "" && !Number.isNaN(num)) {
                  setSearchParams({ ...searchParams, monto_min: num });
                } else {
                  const { monto_min, ...rest } = searchParams;
                  setSearchParams(rest);
                }
              }}            
              >
              </Form.Control>

            </Form.Group>
        </Col>

        <Col >
            <Form.Group controlId = "monto_max">
              <Form.Label>Monto máx.</Form.Label>
              <Form.Control 
              onChange={(e) => {
                const value = e.target.value;
                const num = Number.parseInt(value);

                if (value !== "" && !Number.isNaN(num)) {
                  setSearchParams({ ...searchParams, monto_max: num });
                } else {
                  const { monto_max, ...rest } = searchParams;
                  setSearchParams(rest);
                }
              }}             
              >
              </Form.Control>

            </Form.Group>
        </Col>

        <Col  className="d-flex align-items-end">
          <Button onClick={() => onSearch(searchParams)}>🔎 Buscar</Button>
        </Col>

      </Row>
      
    </Form>
    </>
  );

}
