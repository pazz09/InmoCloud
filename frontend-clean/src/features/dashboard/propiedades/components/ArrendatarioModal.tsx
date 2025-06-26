import { property_form_add_schema, property_form_add_t, property_form_arrendatario_t, property_form_edit_t } from "@/types";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useUserList } from "../../usuarios/hooks/useUserList";
import { fechaToString } from "@/utils/fecha";

interface PropertyModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: property_form_arrendatario_t) => void;
  initialFormValues?: property_form_arrendatario_t;
  mode?: "view" | "edit" | "delete" | "arrendatario" | null;
}

export default function PropertyModal({
  show, 
  onClose, 
  onSubmit, 
  initialFormValues,
  mode = null
}: PropertyModalProps) {
  const [arrendatarioId, setArrendatarioId] = useState<string>("-1");
  const [fechaString, setFechaString] = useState<string>("");
  const [reset, setReset] = useState(true);

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof property_form_arrendatario_t, string>>>({});
  const { users } = useUserList();

  useEffect(() => {
    if (show && reset && initialFormValues) {
      if (initialFormValues.arrendatario_id)
        setArrendatarioId(initialFormValues.arrendatario_id.toString());
      else
        setArrendatarioId("-1");

      if (initialFormValues.fecha_arriendo)
        setFechaString(fechaToString(initialFormValues.fecha_arriendo));
      else
        setFechaString("");

      setReset(false)
    }
    setFormErrors({});
  }, [show, initialFormValues]);

  useEffect(() => {
    if (show == false) setReset(true)
  }, [show])

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof property_form_arrendatario_t, string>> = {};

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
        console.log(fechaString)
        const formValues = {
          arrendatario_id: arrendatarioId !== "-1" ? Number(arrendatarioId) : null,
          fecha_arriendo: new Date(fechaString)
        };

        const errors: Partial<Record<keyof property_form_arrendatario_t, string>> = {};
        setFormErrors(errors);
        if(Object.keys(errors).length === 0)
          onSubmit(formValues);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Asignar arrendatario</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Arrendatario *</Form.Label>
            <Form.Select
              name="arrendatario_id"
              value={arrendatarioId}
              onChange={(e) => setArrendatarioId(e.target.value)}
            >
              <option value={-1}>Seleccione un arrendatario</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre + " " + user.apellidos}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.arrendatario_id}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de contrato</Form.Label>
          <Form.Control
            type="date"
            name="fecha_arriendo"
            value={fechaString}
            onChange={(e) => setFechaString(e.target.value)}
          />
            <Form.Control.Feedback type="invalid">
              {formErrors.fecha_arriendo}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {mode === "view" ? "Cerrar" : "Cancelar"}
        </Button>
        {mode !== "view" && (
          <Button
            variant="primary"
            onClick={handleSubmit}
          >
            Guardar
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
