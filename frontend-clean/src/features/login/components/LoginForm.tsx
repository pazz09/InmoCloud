'use client';

import { Form, Button, Alert } from 'react-bootstrap';
import { formatRutInput } from "@/utils/rut"
import { login_t } from '@/types';

interface LoginFormProps {
  rut: string;
  password: string;
  submitting: boolean;
  redirecting: boolean;
  onRutChange: (val: string) => void,
  onPasswordChange: (val: string) => void,
  formErrors: Partial<Record<keyof login_t, string>>,
  onSubmit: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  submitting,
  redirecting,
  rut,
  password,
  formErrors,
  onRutChange,
  onPasswordChange,
  onSubmit,
}) => {

  return (
    <div
      className="p-5 shadow rounded bg-white"
      style={{ minWidth: "300px", maxWidth: "400px" }}
    >
      <h3 className="text-center mb-4" style={{ color: "#2c3e50" }}>
        Iniciar sesión
      </h3>
      <Form 
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        >
        <Form.Group controlId="rut" className="mb-3">
          <Form.Label>RUT</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: 12.345.678-K"
            value={rut}
            onChange={(e) => onRutChange(formatRutInput(e.target.value))}
            isInvalid={!!formErrors.rut}
            required
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.rut}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            isInvalid={!!formErrors.password}
            required
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.password}
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          type="submit"
          disabled={submitting || redirecting}
          variant="dark"
          className="w-100 mt-2"
        >
          {submitting ? 'Ingresando...' : redirecting ? 'Redirigiendo...' : 'Ingresar'}
        </Button>
      </Form>
    </div>
  );
};

export default LoginForm;
