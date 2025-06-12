import { property_form_add_schema, property_form_add_t, property_form_edit_t } from "@/types";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useUserList } from "../../usuarios/hooks/useUserList";

interface PropertyModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: property_form_add_t | property_form_edit_t) => void;
  editing: boolean;
  initialFormValues?: property_form_edit_t;
  mode?: "view" | "edit" | "delete" | null;
}

export default function PropertyModal({
  show, 
  onClose, 
  onSubmit, 
  editing, 
  initialFormValues,
  mode = null
}: PropertyModalProps) {
  
  const [formValues, setFormValues] = useState<property_form_add_t>({
    rol: "",
    direccion: "",
    activa: false,
    valor: 0,
    propietario_id: -1,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof property_form_add_t, string>>>({});
  const { users } = useUserList();

  useEffect(() => {
    if (show) {
      if (editing && initialFormValues) {
        setFormValues({
          rol: initialFormValues.rol,
          direccion: initialFormValues.direccion,
          activa: initialFormValues.activa,
          valor: initialFormValues.valor,
          propietario_id: initialFormValues.propietario_id,
        });
      } else {
        // Reset form for new property
        setFormValues({
          rol: "",
          direccion: "",
          activa: false,
          valor: 0,
          propietario_id: -1,
        });
      }
    }
    setFormErrors({});
  }, [show, editing, initialFormValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormValues((prev) => {
      if (type === "checkbox") {
        const target = e.target as HTMLInputElement;
        return { ...prev, [name]: target.checked };
      } else if (name === "valor") {
        return { ...prev, [name]: value === "" ? "" : Number(value) };
      } else if (name === "propietario_id") {
        return { ...prev, [name]: Number(value) };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof property_form_add_t, string>> = {};
    
    if (!formValues.direccion.trim()) {
      errors.direccion = "La dirección es obligatoria";
    }
    
    if (!formValues.valor || parseFloat(formValues.valor.toString()) <= 0) {
      errors.valor = "El valor debe ser mayor a 0";
    }

    if (!formValues.propietario_id || formValues.propietario_id === -1) {
      errors.propietario_id = "Debe seleccionar un propietario";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (mode === "view") {
      onClose();
      return;
    }
    
    if (mode === "delete") {
      onSubmit(formValues);
      return;
    }
    
    if (validateForm()) {
      // Convert valor to number before submitting
      const submitValues = {
        ...formValues,
        valor: parseFloat(formValues.valor.toString()) || 0
      };
      onSubmit(submitValues);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case null: return "Nueva Propiedad";
      case "edit": return "Editar Propiedad";
      case "view": return "Detalles de Propiedad";
      case "delete": return "Eliminar Propiedad";
      default: return "Propiedad";
    }
  };

  const isReadOnly = mode === "view";

  // Don't render the modal for delete mode as it's handled in the parent component
  if (mode === "delete") {
    return null;
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{getModalTitle()}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>ROL</Form.Label>
            <Form.Control
              name="rol"
              type="text"
              value={formValues.rol}
              onChange={handleChange}
              isInvalid={!!formErrors.rol}
              readOnly={isReadOnly}
              maxLength={15}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.rol}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Dirección *</Form.Label>
            <Form.Control
              name="direccion"
              type="text"
              value={formValues.direccion}
              onChange={handleChange}
              isInvalid={!!formErrors.direccion}
              readOnly={isReadOnly}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.direccion}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Valor (Canon) *</Form.Label>
            <Form.Control
              name="valor"
              type="number"
              value={formValues.valor}
              onChange={handleChange}
              isInvalid={!!formErrors.valor}
              readOnly={isReadOnly}
              placeholder="Ingrese el valor"
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.valor}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Propietario *</Form.Label>
            <Form.Select
              name="propietario_id"
              value={formValues.propietario_id}
              onChange={handleChange}
              isInvalid={!!formErrors.propietario_id}
              disabled={isReadOnly}
            >
              <option value={-1}>Seleccione un propietario</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre + " " + user.apellidos}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.propietario_id}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="activa"
              label="Propiedad Activa"
              checked={formValues.activa}
              onChange={handleChange}
              disabled={isReadOnly}
            />
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