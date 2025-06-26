import { property_form_add_schema, property_form_add_t, property_form_arrendatario_t, property_form_edit_t } from "@/types";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useUserList } from "../../usuarios/hooks/useUserList";

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
  
  const [formValues, setFormValues] = useState<property_form_arrendatario_t>({
    arrendatario_id: -1,
    fecha_arriendo: null
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof property_form_arrendatario_t, string>>>({});
  const { users } = useUserList();

  useEffect(() => {
    if (show) {
      setFormValues({
          arrendatario_id: initialFormValues?.arrendatario_id,
          fecha_arriendo: initialFormValues?.fecha_arriendo
      });
    }
    setFormErrors({});
  }, [show, initialFormValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormValues((prev) => {
      if (name === "arrendatario_id") {
        return { ...prev, arrendatario_id: Number(value) };
      } else if (name === "fecha_arriendo") {
        return { ...prev, fecha_arriendo: new Date(value) };
      }
      return prev; // Asegura que siempre haya retorno
    });
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof property_form_arrendatario_t, string>> = {};

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
        formValues.arrendatario_id = formValues.arrendatario_id !== -1 ? formValues.arrendatario_id : null
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
              value={formValues.arrendatario_id ? formValues.arrendatario_id : -1}
              onChange={handleChange}
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
            value={
              formValues.fecha_arriendo
                ? `${formValues.fecha_arriendo.getFullYear()}-${String(formValues.fecha_arriendo.getMonth() + 1).padStart(2, '0')}-${String(formValues.fecha_arriendo.getDate()).padStart(2, '0')}`
                : ""
            }
            onChange={handleChange}
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
