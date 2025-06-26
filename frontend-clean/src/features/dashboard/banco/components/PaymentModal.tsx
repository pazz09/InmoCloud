import { payment_form_data_schema, payment_form_data_t, property_form_add_t, property_search_schema } from "@/types";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import z from "zod";
import { useUserList } from "../../usuarios/hooks/useUserList";
import { usePropertyList } from "../../propiedades/hooks/usePropertyList";
import { fechaToString } from "@/utils/fecha";

const payment_form_data_input_schema = payment_form_data_schema.extend({fecha: z.string()});
type payment_form_data_input_t = z.infer<typeof payment_form_data_input_schema>;

interface PaymentModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: payment_form_data_t, id?: number) => Promise<void>;
  editing: boolean;
  initialFormValues?: payment_form_data_input_t;
  propertyId?: number;
}


// const property_form_add_partial_schema = property_search_schema.partial();
// type property_form_add_partial_t = z.infer<typeof property_search_schema>;

export default function PaymentModal({show, onClose, onSubmit, editing, initialFormValues, propertyId}: PaymentModalProps) {

  const [formValues, setFormValues] = useState({
      fecha: "",
      tipo: "false",
      monto: "",
      pagado: false,
      categoria: "CAT_A",
      detalle: "",
      usuario_id: "",
      propiedad_id: "",
  });

  const [formErrors, setFormErrors] =  useState<Partial<Record<keyof payment_form_data_t, string>>>({});

  
  const { users } = useUserList();
  const { propiedades } = usePropertyList();

  useEffect(() => {
    if (show && initialFormValues) {
      const newValues = {
        fecha: initialFormValues.fecha || "",
        tipo: initialFormValues.tipo?.toString() ?? "false",
        monto: initialFormValues.monto?.toString() ?? "",
        pagado: initialFormValues.pagado ?? false,
        categoria: initialFormValues.categoria || "CAT_A",
        detalle: initialFormValues.detalle || "",
        usuario_id: initialFormValues.usuario_id != null ? initialFormValues.usuario_id.toString() : "-1",
        propiedad_id: initialFormValues.propiedad_id != null ? initialFormValues.propiedad_id.toString() : "-1"
      };
      setFormValues(newValues);
    }
    setFormErrors({});
  }, [show, initialFormValues]);

  useEffect(() => {
    console.log(formValues);
  }, [formValues])

  async function handleSubmit(): Promise<void> {
    const parsedValues = {
      fecha: new Date(formValues.fecha),
      tipo: formValues.tipo === "true",
      monto: Number(formValues.monto),
      pagado: formValues.pagado,
      categoria: formValues.categoria,
      detalle: formValues.detalle,
      usuario_id: formValues.usuario_id == "-1" ? null : Number(formValues.usuario_id),
      propiedad_id: formValues.propiedad_id == "-1" ? null : Number(formValues.propiedad_id),
      id: initialFormValues?.id
    };

    const parse = payment_form_data_schema.safeParse(parsedValues);
    if (!parse.success) {
      console.log("error :(");
      const errors: Partial<Record<keyof payment_form_data_input_t, string>> = {}

      parse.error.errors.forEach((err) => {
        const field = err.path[0] as keyof payment_form_data_input_t;
        errors[field] = err.message;
        console.log(err.message);
      })
      setFormErrors(errors);
    } else {
      setFormErrors({});
      console.log("Submitting")
      await onSubmit(parse.data);
    }
  }

  return (<>
    <Modal show={show} onHide={() => {onClose()}}>
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
              onChange={(e) => setFormValues({...formValues, fecha: e.target.value})}
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
              value={formValues.tipo}
              onChange={(e) => setFormValues({...formValues, tipo: e.target.value})}
              isInvalid={!!formErrors.tipo}
            >
              <option value="false">Giro</option>
              <option value="true">Depósito</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.tipo}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Monto</Form.Label>
            <Form.Control name="monto"  value={formValues.monto}
            onChange={(e) => setFormValues({...formValues, monto: e.target.value})}
            isInvalid={!!formErrors.monto}
            >
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {formErrors.monto}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label >Pagado</Form.Label>
            <Form.Check type = "checkbox"
            name = "pagado"
            checked={formValues.pagado}
            onChange={(e) => setFormValues({...formValues, pagado: e.target.checked})}
            >
            </Form.Check>

          </Form.Group>


          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={formValues.categoria}
              onChange={(e) => setFormValues({...formValues, categoria: e.target.value})}
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
            <Form.Control name="detalle" type="text" value={formValues.detalle}
            onChange={(e) => setFormValues({...formValues, detalle: e.target.value})}
            isInvalid={!!formErrors.detalle}
            >
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Usuario</Form.Label>
            <Form.Select
              name="usuario_id"
              value={formValues.usuario_id}
              onChange={(e) => setFormValues({...formValues, usuario_id: e.target.value})}
              isInvalid={!!formErrors.usuario_id}
            >
              <option value="-1"> Seleccione un usuario</option>
              {users?.map((user) => (
                <option key={user.id} value = {user.id}>{user.nombre + " " + user.apellidos}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.usuario_id}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Propiedad</Form.Label>
            <Form.Select
              name="propiedad_id"
              value={formValues.propiedad_id!}
              onChange={(e) => setFormValues({...formValues, propiedad_id: e.target.value})}
              isInvalid={!!formErrors.propiedad_id}
            >
              <option value="-1"> Seleccione una propiedad</option>
              {propiedades?.map((property) => (
                <option key={property.id} value = {property.id}>{property.direccion}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.propiedad_id}
            </Form.Control.Feedback>
          </Form.Group>




        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  </>)


}

