import { payment_form_data_schema, payment_form_data_t, property_form_add_t, property_search_schema } from "@/types";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import z from "zod";
import { useUserList } from "../../usuarios/hooks/useUserList";
import { usePropiedadesPage } from "../../propiedades/hooks/usePropiedadesPage";

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

  
  const { users } = useUserList();
  const { propiedades } = usePropiedadesPage();


  const [tipo, setTipo] = useState("false");

  useEffect(() => {
    if (show && initialFormValues) {
      setFormValues(initialFormValues);
    }
  }, [show, initialFormValues])

  useEffect(() => {
    console.log(formValues);

    const parse = payment_form_data_schema.safeParse(formValues);
    if (!parse.success) {
      const errors: Partial<Record<keyof payment_form_data_input_t, string>> = {}

      parse.error.errors.forEach((err) => {
        const field = err.path[0] as keyof payment_form_data_input_t;
        errors[field] = err.message;
        console.log(err.message);
      })
      setFormErrors(errors);
    }
  }, [formValues])



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(name, value)

    if (name === "tipo") {
      setFormValues((prev: payment_form_data_input_t) => ({
        ...prev,
        [name]: value === "true",
      }));

      return;
    } else if (name === "usuario_id" || name === "propiedad_id" || name === "monto") {
      setFormValues((prev: payment_form_data_input_t) => ({
        ...prev,
        [name]: Number(value),
      }));


      return;

    }

    setFormValues((prev: payment_form_data_input_t) => ({
      ...prev,
      [name]: value
    }));
    console.log(formValues);
  };
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
              value={tipo}
              onChange={(e) => {setTipo(e.target.value);}}
              isInvalid={!!formErrors.fecha}
            >
              <option value="true">Giro</option>
              <option value="false">Depósito</option>
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
            <Form.Label >Pagado</Form.Label>
            <Form.Check type = "checkbox"
            name = "pagado"
            onChange={(e) => {setFormValues({...formValues, pagado: e.target.checked})}}
            >
            </Form.Check>

          </Form.Group>


          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={formValues.categoria}
              onChange={handleChange}
              isInvalid={!!formErrors.categoria}
            >
              <option value="CAT_A">CAT_A</option>
              <option value="CAT_B">CAT_B</option>
              <option value="CAT_C">CAT_C</option>
              <option value="CAT_D">CAT_D</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.categoria}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Detalle</Form.Label>
            <Form.Control name="detalle" type="text" value={formValues.detalle && formValues.detalle || ""}
            onChange={handleChange}
            isInvalid={!!formErrors.monto}
            >
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Usuario</Form.Label>
            <Form.Select
              name="usuario_id"
              value={formValues.usuario_id}
              onChange={handleChange}
              isInvalid={!!formErrors.usuario_id}
            >
              <option> Seleccione un usuario</option>
              {users?.map((user) => (
                <option key={user.id} value = {user.id}>{user.nombre + " " + user.apellidos}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.categoria}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Propiedad</Form.Label>
            <Form.Select
              name="propiedad_id"
              value={formValues.propiedad_id}
              onChange={handleChange}
              isInvalid={!!formErrors.propiedad_id}
            >
              <option> Seleccione una propiedad</option>
              {propiedades?.map((property) => (
                <option key={property.id} value = {property.id}>{property.direccion}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.categoria}
            </Form.Control.Feedback>
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

