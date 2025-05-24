import { useState } from 'react';
import Head from 'next/head';
import NavigationBar from '@/components/Navbar';
import { Form, Button, Alert, Container, Row, Col, Card} from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

function formatRutInput(ev: React.ChangeEvent<HTMLInputElement>): string {
  const value = ev.target.value;
  // Remove any character that isn't digit or 'k'/'K'
  const clean = value.replace(/[^\dkK]/g, '').toUpperCase();

  let result = '';
  const body = clean.slice(0, -1);

  // Format body with thousands separators
  let formattedBody = '';
  let reversed = body.split('').reverse();

  for (let i = 0; i < reversed.length; i++) {
    formattedBody = reversed[i] + formattedBody;
    if ((i + 1) % 3 === 0 && i + 1 !== reversed.length) {
      formattedBody = '.' + formattedBody;
    }
  }

  const dv = clean.slice(-1);
  return dv ? `${formattedBody}-${dv}` : formattedBody;
}

function validarRut(rut: string): boolean {
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

  const mockLogin = (rut: string, password: string): UserType | null => {
    if (rut.startsWith('3')) return 'administrador';
    return null;
  };

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rut || !password) {
      setError('Por favor, completa ambos campos.');
      return;
    }

    /*

    if (!validarRut(rut)) {
      setError('El RUT ingresado no es válido.');
      return;
    }
    */

    const userType = mockLogin(rut, password);

    if (!userType) {
      setError('Usuario o contraseña incorrectos.');
      return;
    }

    setError('');
    login(); // Activamos el estado de autenticación global

    switch (userType) {
      case 'administrador':
        router.push('/dashboard/principal');
        break;
    }
  };
  

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
                    onChange={(e) => setRut(formatRutInput(e))}
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
