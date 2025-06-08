import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { login_schema, response_login } from '@/backend/types';
import { loginUser } from '@/services/login';
import { rut_schema } from '@/types';
import z from 'zod';
import { useTimedAlerts } from '@/hooks/useTimedAlerts';
import { AppError } from '@/utils/errors';

const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');

const formSchema = z.object({
  rut: rut_schema,
  password: passwordSchema,
});

type LoginFormData = z.infer<typeof formSchema>;

export const useLogin = () => {
  const [formData, setFormData] = useState<LoginFormData>({ rut: '', password: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);


  const {
    visibleAlerts,
    addError,
    addSuccess,
  } = useTimedAlerts();


  const { login } = useAuth();
  const router = useRouter();

  const validateField = (key: keyof LoginFormData, value: string) => {

    let schema: z.ZodTypeAny;

    if (key === 'rut') schema = rut_schema;
    else if (key === 'password') schema = passwordSchema;
    else return;

    const result = schema.safeParse(value);
    return result.success ? '' : result.error.errors[0].message;
  };

  const onRutChange = (value: string) => {
    setFormData(prev => ({ ...prev, rut: value }));
    setTouchedFields(prev => ({ ...prev, rut: true }));
    if (!touchedFields.rut) return;
    const error = validateField('rut', value);
    setFormErrors(prev => ({ ...prev, rut: error }));
  };

  const onPasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    setTouchedFields(prev => ({ ...prev, password: true }));
    if (!touchedFields.password) return;
    const error = validateField('password', value);
    setFormErrors(prev => ({ ...prev, password: error }));
  };

  const handleSubmit = async () => {
    console.log("useLogin: handleSubmit")
    setSubmitting(true);
    try {
      const body = login_schema.parse(formData);
      const res = await loginUser(body);
      const login_response = response_login.parse(res);
      const token = login_response.data!.token;
      localStorage.setItem('token', token);
      login(token);

      addSuccess('Inicio de sesión exitoso');
      setRedirecting(true);
      router.push('/dashboard/principal');
    } catch (err) {
      console.log(err);
      if (err instanceof z.ZodError) {
        addError('Datos inválidos. Verifica los campos.');
      } 
      if (err instanceof AppError)
        addError("Error: " + err.message);
    } finally {
      setSubmitting(false);
      setRedirecting(false);
    }
  };



  return {
    ...formData,
    formErrors,
    submitting,
    redirecting,
    onRutChange,
    onPasswordChange,
    handleSubmit,
    visibleAlerts
  };
};

