import { Modal, Button, Form, Alert } from "react-bootstrap";
import { RoleHierarchy, user_form_data, user_form_data_t, user_union_t, UserRoleEnum } from "@/types";
import { useEffect, useState } from "react";

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
    nombre: "",
    apellidos: "",
    mail: "",
    telefono: "",
    passwordHash: "",
    type: "full",
    rut: "",
    role: UserRoleEnum.SIN_SESION,
  });
  

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof user_union_t, string>>>({});
  const [generatedPassword, setGeneratedPassword] = useState("");

  const { role: user_role } = useAuth();
  const availableRoles = RoleHierarchy.filter(
  (role) => RoleHierarchy.indexOf(role) < RoleHierarchy.indexOf(user_role)
);

  useEffect(() => {
    // console.log("Show trigger", formValues);
    // console.log("availableRoles", availableRoles);
    if (show && initialFormValues) {
      setFormValues(initialFormValues);
    } else if (show && !initialFormValues) {
      setFormValues({
        nombre: "",
        apellidos: "",
        mail: "",
        telefono: "",
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
    //const requesterRole = (() => {
    //    try {
    //      const token = localStorage.getItem("token");
    //      const decoded = jwtDecode<token_t>(token!);
    //      return decoded.role;
    //    } catch (err) {
    //      console.log(err)
    //      return UserRoleEnum.SIN_SESION;
    //    }
    //  })();

  // console.log("requesterRole", requesterRole)

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
  }, [show, userId]);


  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev: user_form_data_t) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitting form values:", formValues);

    const cleanedFormValues = {
      ...formValues,
      mail: formValues.mail === "" ? undefined : formValues.mail,
      telefono: formValues.telefono === "" ? undefined : formValues.telefono,
    };

    const parsed = user_form_data.safeParse(cleanedFormValues);
    console.log("Parsed form values:", parsed);
    console.log("errors", parsed.error);

    if (!parsed.success) {
      const errors: Partial<Record<keyof user_union_t, string>> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path[0] as keyof user_union_t;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    onSubmit(cleanedFormValues, userId);
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
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              value={formValues.nombre}
              onChange={handleChange}
              isInvalid={!!formErrors.nombre}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.nombre}
            </Form.Control.Feedback>
          </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Apellidos</Form.Label>
          <Form.Control
            type="text"
            name="apellidos"
            value={formValues.apellidos}
            onChange={handleChange}
            isInvalid={!!formErrors.apellidos}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.apellidos}
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

          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control
            type="email"
            name="mail"
            value={formValues.mail ? formValues.mail : ""}
            onChange={handleChange}
            isInvalid={!!formErrors.mail}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.mail}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            name="telefono"
            value={formValues.telefono ? formValues.telefono : ""}
            onChange={handleChange}
            isInvalid={!!formErrors.telefono}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.telefono}
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
