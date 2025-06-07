'use client';

import { Form, Button, Alert } from 'react-bootstrap';
import { rut_schema } from '@/types'
import { z } from 'zod';
import { useState } from 'react';

interface LoginFormProps {
    rut: string;
    password: string;
    submitting: boolean;
    redirecting: boolean;
    error: string;
    onRutChange: (val: string) => void;
    onPasswordChange: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}



const loginSchema = z.object({
    rut: rut_schema,
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC<LoginFormProps> = ({
    rut,
    password,
    submitting,
    redirecting,
    error,
    onRutChange,
    onPasswordChange,
    onSubmit,
}) => {

    const [formErrors, setFormErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
    const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = loginSchema.safeParse({ rut, password });

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof LoginFormData;
                fieldErrors[field] = err.message;
            });
            setFormErrors(fieldErrors);
            return;
        }

        setFormErrors({});
        onSubmit(e);
    };

    const handleRutChange = (val: string) => {
        onRutChange(val);
        setTouchedFields((prev) => ({ ...prev, rut: true }));
        if (!touchedFields.rut || val === "") return;
        const result = rut_schema.safeParse(val);
        setFormErrors((prev) => ({
            ...prev,
            rut: result.success ? '' : result.error.errors[0].message,
        }));
    };



    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formRut">
                <Form.Label>RUT</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ej: 12.345.678-K"
                    value={rut}
                    onChange={e => handleRutChange(e.target.value)}
                    isInvalid={!!formErrors.rut}
                    required
                />

                <Form.Control.Feedback type="invalid">
                    {formErrors.rut}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    isInvalid={!!formErrors.password}
                    required
                />
                <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                </Form.Control.Feedback>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
                type="submit"
                disabled={submitting || redirecting}
                variant="dark"
                className="w-100 mt-2"
            >
                {submitting ? 'Ingresando...' : redirecting ? 'Redirigiendo...' : 'Ingresar'}
            </Button>

            <div className="text-center mt-3">
                <a href="#" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>¿Olvidaste tu contraseña?</a>
            </div>
        </Form>
    );
};

export default LoginForm;
