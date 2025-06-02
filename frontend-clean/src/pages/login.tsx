'use client';
import { useState } from 'react';
import Head from 'next/head';
import NavigationBar from '@/components/Navbar';
import { Form, Button, Alert, Container, Row, Col, Card} from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { empty_response_schema, login_response_schema, login_schema, response_login, response_login_t } from "@/backend/types";
import z from 'zod';

export function formatRutInput(value: string): string {
  // const value = ev.target.value;
  // Remove any character that isn't digit or 'k'/'K'
  const clean = value.replace(/[^\dkK]/g, '').toUpperCase();

  const body = clean.slice(0, -1);

  // Format body with thousands separators
  let formattedBody = '';
  const reversed = body.split('').reverse();

  for (let i = 0; i < reversed.length; i++) {
    formattedBody = reversed[i] + formattedBody;
    if ((i + 1) % 3 === 0 && i + 1 !== reversed.length) {
      formattedBody = '.' + formattedBody;
    }
  }

  const dv = clean.slice(-1);
  return dv ? `${formattedBody}-${dv}` : formattedBody;
}

export function validarRut(rut: string): boolean {
  rut = rut.replace(/[^\dkK]/g, '').toUpperCase();
  if (rut.length < 8) return false;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dv === dvCalculado;
}

type UserType = 'administrador';

const Login = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth(); // Importante: usamos el contexto aquí
  const body = login_schema.parse({rut, password});

  // const mockLogin = (rut: string, password: string): UserType | null => {
  //   if (rut.startsWith('3')) return 'administrador';
  //   return null;
  // };
  //




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!rut || !password) {
      setError('Por favor, completa ambos campos.');
      return;
    }

    // Optionally validate input schema here
    let body;
    try {
      body = login_schema.parse({ rut, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError('Campos inválidos. Revisa los datos ingresados.');
        return;
      }
      setError('Error inesperado en los datos.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_URL || ''}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Handle 401 or other non-200 responses
      if (!res.ok) {
        if (res.status === 401) {
          setError('Usuario o contraseña incorrectos.');
        } else if (res.status === 404) {
          setError(empty_response_schema.parse(await res.json()).message!);
        } else {
          setError('Error al iniciar sesión. Inténtalo más tarde.');
        }
        return;
      }

      const json_obj = await res.json();

      // Validate the response structure
      let login_response: response_login_t;
      try {
        login_response = response_login.parse(json_obj);
        // All good, perform login
        const token = login_response.data!.token; // assuming your backend returns { token, user }
        localStorage.setItem('token', token);
        login(token); // Context method
        router.push('/dashboard/principal');
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error("Error en el schema de respuesta:", err);
          setError("Respuesta del servidor no es válida.");
          return;
        }
      }
  } catch (err) {
    console.error('Error en el fetch:', err);
    setError('Error al conectar con el servidor.');
  }
};

/*

   if (!validarRut(rut)) {
   setError('El RUT ingresado no es válido.');
   return;
   }
   */

// const userType = mockLogin(rut, password);

// if (!userType) {
//   setError('Usuario o contraseña incorrectos.');
//   return;
// }

//   setError('');
//   login(); // Activamos el estado de autenticación global
//
//   switch (userType) {
//     case 'administrador':
//       router.push('/dashboard/principal');
//       break;
//   }
// };


return (
  <>
  <Head>
  <title>Iniciar sesión – InmoCloud</title>
  </Head>
  <NavigationBar />
  <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh', backgroundColor: '#f5f6f7' }}>
  <Row>
  <Col md={12}>
  <div className="p-5 shadow rounded bg-white" style={{ minWidth: '300px', maxWidth: '400px' }}>
  <h3 className="text-center mb-4" style={{ color: '#2c3e50' }}>Iniciar sesión</h3>
  <Form onSubmit={handleSubmit}>
  <Form.Group className="mb-3" controlId="formRut">
  <Form.Label>RUT</Form.Label>
  <Form.Control
  type="text"
  placeholder="Ej: 12.345.678-K"
  value={rut}
  onChange={(e) => setRut(formatRutInput(e.target.value))}
  required
  />
  </Form.Group>

  <Form.Group className="mb-3" controlId="formPassword">
  <Form.Label>Contraseña</Form.Label>
  <Form.Control
  type="password"
  placeholder="Ingresa tu contraseña"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  />
  </Form.Group>

  {error && <Alert variant="danger">{error}</Alert>}

  <Button variant="dark" type="submit" className="w-100 mt-2">
  Ingresar
  </Button>
  <div className="text-center mt-3">
  <a href="#" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>¿Olvidaste tu contraseña?</a>
  </div>
  </Form>
  </div>
  </Col>
  </Row>
  </Container>
  </>
);
};

export default Login;
