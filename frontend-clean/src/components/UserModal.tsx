import { Modal, Button, Form, Alert } from "react-bootstrap";
import { RoleHierarchy, token_t, user_form_data_t, user_union_schema, user_union_t, UserRoleEnum } from "@/backend/types";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import bcrypt from 'bcryptjs';
import { useAuth } from "@/context/AuthContext";

const generateHash = async (plain: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plain, salt);
};

interface UserModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: user_form_data_t, id?: number) => void;
  editing: boolean;
  initialFormValues?: user_form_data_t;
  userId?: number;
}

export default function UserModal({
  show,
  editing,
  onClose,
  onSubmit,
  userId,
  initialFormValues,
}: UserModalProps) {

  const [formValues, setFormValues] = useState<user_form_data_t>({
    name: "",
    rut: "",
    role: UserRoleEnum.SIN_SESION,
    passwordHash: "",
    type: "full",
  });
  

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof user_union_t, string>>>({});
  const [generatedPassword, setGeneratedPassword] = useState("");

  const { role: user_role } = useAuth();
  const availableRoles = RoleHierarchy.filter(
  (role) => RoleHierarchy.indexOf(role) < RoleHierarchy.indexOf(user_role)
);

  useEffect(() => {
    console.log("Show trigger", formValues);
    console.log("availableRoles", availableRoles);
    if (show && initialFormValues) {
      setFormValues(initialFormValues);
    } else if (show && !initialFormValues) {
      setFormValues({
        name: "",
        rut: "",
        role: UserRoleEnum.SIN_SESION,
        passwordHash: "",
        type: "full",
      });
    }
    setFormErrors({});
  }, [show]);


  useEffect(() => {

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

    // if (show && initialValues) {
    //   setFormValues(initialValues);
    //   setFormErrors({});
    // } else if (show && !initialValues) {
    //   // Clear form when creating a new user
    //   setFormValues({
    //     id: -1,
    //     name: "",
    //     rut: "",
    //     role: UserRoleEnum.SIN_SESION,
    //     passwordHash: "",
    //     type: "full",
    //   });
    //   setFormErrors({});
    // }
  }, [show, formValues, userId]);


  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev: user_form_data_t) => ({ ...prev, [name]: value }));
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
        <Modal.Title>{editing ? "Editar Usuario" : "Nuevo Usuario"}</Modal.Title>
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

          <Form.Group controlId="formRole" className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              name="role"
              value={formValues.role}
              onChange={handleChange}
              isInvalid={!!formErrors.role}
            >
              <option value="">Seleccione un rol</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.role}
            </Form.Control.Feedback>
          </Form.Group>

          {formValues.type === "full" && (
            <>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {formValues.passwordHash !== "" ? "Establecida" : "No establecida"}
                </div>
                <Button
                  variant="warning"
                  className="mb-3"
                  onClick={async () => {
                    const plain = Math.random().toString(36).slice(-10);
                    const hashed = await generateHash(plain); // 🔐 make sure generateHash is defined
                    console.log("Nueva contraseña (plana):", plain);
                    setGeneratedPassword(plain);
                    setFormValues((prev: user_form_data_t) => ({ ...prev, passwordHash: hashed }));
                  }}
                >
                  🔒 Resetear Contraseña
                </Button>
              </div>
            </Form.Group>
            { generatedPassword &&  (<>
              <Alert variant="info">
                Contraseña generada: <strong>{generatedPassword}</strong>
              </Alert>
            </>) }
          </>

          )}

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => {setGeneratedPassword(""); onClose()}}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
