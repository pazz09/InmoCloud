import { Modal, Button, Form } from "react-bootstrap";
import { token_t, user_union_schema, user_union_t, UserRoleEnum } from "@/backend/types";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";

interface UserModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: user_union_t, id?: number) => void;
  initialValues?: user_union_t;
  userId?: number;
}

export default function UserModal({
  show,
  onClose,
  onSubmit,
  initialValues,
  userId,
}: UserModalProps) {
  const [formValues, setFormValues] = useState<user_union_t>({
    id: -1,
    name: "",
    rut: "",
    role: UserRoleEnum.SIN_SESION,
    passwordHash: "",
    type: "full",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof user_union_t, string>>>({});

  useEffect(() => {
    if (show && initialValues) {
      setFormValues(initialValues);
      setFormErrors({});
    } else if (show && !initialValues) {
      // Clear form when creating a new user
      setFormValues({
        id: -1,
        name: "",
        rut: "",
        role: UserRoleEnum.SIN_SESION,
        passwordHash: "",
        type: "full",
      });
      setFormErrors({});
    }
  }, [show, initialValues, userId]);


  // Decode token
  const requesterRole = (() => {
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode<token_t>(token!);
      return decoded.role;
    } catch (err) {
      console.log(err)
      return UserRoleEnum.SIN_SESION;
    }
  })();
  console.log("requesterRole", requesterRole)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const parsed = user_union_schema.safeParse(formValues);
    if (!parsed.success) {
      const errors: Partial<Record<keyof user_union_t, string>> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path[0] as keyof user_union_t;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    onSubmit(formValues, userId);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{userId ? "Editar Usuario" : "Nuevo Usuario"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              name="name"
              value={formValues.name}
              onChange={handleChange}
              isInvalid={!!formErrors.name}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>RUT</Form.Label>
            <Form.Control
              name="rut"
              value={formValues.rut}
              onChange={handleChange}
              isInvalid={!!formErrors.rut}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.rut}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              name="role"
              value={formValues.role}
              onChange={handleChange}
              isInvalid={!!formErrors.role}
            >
              <option value={UserRoleEnum.ADMIN}>Administrador</option>
              <option value={UserRoleEnum.USER}>Usuario</option>
              <option value={UserRoleEnum.SIN_SESION}>Sin sesión</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.role}
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
  );
}
