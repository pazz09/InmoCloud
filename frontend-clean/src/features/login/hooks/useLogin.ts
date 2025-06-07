import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { login_schema, response_login, empty_response_schema } from '@/backend/types';
import { loginUser } from '@/services/login';
import z from 'zod';

export const useLogin = () => {
    const [rut, setRut] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [submitting, setSubmitting] = useState(false); // For login form submission
    const [redirecting, setRedirecting] = useState(false); // For dashboard redirect


    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const body = login_schema.parse({ rut, password });
            const res = await loginUser(body);

            const login_response = response_login.parse(res);
            const token = login_response.data!.token;
            localStorage.setItem('token', token);
            login(token);
            setRedirecting(true);
            router.push('/dashboard/principal');
            setRedirecting(false);
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                setError('Datos inválidos. Verifica los campos.');
            } else if (err.status === 401) {
                setError('Usuario o contraseña incorrectos.');
            } else if (err.status === 404) {
                const json = await err.json();
                setError(empty_response_schema.parse(json).message!);
            } else {
                setError('Error inesperado. Intenta nuevamente.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return {
        rut,
        setRut,
        password,
        setPassword,
        error,
        loading,
        submitting,
        redirecting,
        handleSubmit
    };
};
