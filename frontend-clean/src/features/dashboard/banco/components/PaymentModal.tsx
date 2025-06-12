import { payment_form_data_schema, payment_form_data_t, property_form_add_t, property_search_schema } from "@/types";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import z from "zod";

const payment_form_data_input_schema = payment_form_data_schema.extend({fecha: z.string()});
type payment_form_data_input_t = z.infer<typeof payment_form_data_input_schema>;

interface PaymentModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: payment_form_data_input_t, id?: number) => void;
  editing: boolean;
  initialFormValues?: payment_form_data_input_t;
  propertyId?: number;
}


// const property_form_add_partial_schema = property_search_schema.partial();
// type property_form_add_partial_t = z.infer<typeof property_search_schema>;



export default function PaymentModal({show, onClose, onSubmit, editing, initialFormValues, propertyId}: PaymentModalProps) {


  const [formValues, setFormValues] = useState<payment_form_data_input_t>({
      fecha: "",
      tipo: false,
      monto: 0,
      pagado: false,
      categoria: "CAT_A",
      detalle: "",
      usuario_id: -1,
      propiedad_id: -1,
  });

  const [formErrors, setFormErrors] =  useState<Partial<Record<keyof payment_form_data_t, string>>>({});
  

  useEffect(() => {
    if (show && initialFormValues)
      setFormValues(initialFormValues);
    setFormErrors({});
  }, [show, initialFormValues])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev: payment_form_data_input_t) => ({ ...prev, [name]: value }));
     
  }

  return (<>
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editing ? "Editar Pago" : "Nuevo Pago"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Fecha pago</Form.Label>
            <Form.Control
              name="fecha"
              type="date"
              value={formValues.fecha}
              onChange={handleChange}
              isInvalid={!!formErrors.fecha}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.fecha}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              name="tipo"
              value={!formValues.tipo ? "Giro" : "Depósito"}
              onChange={handleChange}
              isInvalid={!!formErrors.fecha}
            >
              <option>Giro</option>
              <option>Depósito</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.fecha}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Monto</Form.Label>
            <Form.Control name="monto" type="number" value={formValues.monto}
            onChange={handleChange}
            isInvalid={!!formErrors.monto}
            >
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check type = "checkbox">Pagado</Form.Check>
          </Form.Group>




        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {}}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={() => {}}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  </>)


}

