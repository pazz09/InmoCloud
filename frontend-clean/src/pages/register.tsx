import { useState } from 'react';
import Head from 'next/head';
import NavigationBar from '@/components/Navbar';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/router';

export default function Register() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('arrendatario');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rut || !password || !userType) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // Aquí podrías validar el RUT igual que en login si quieres

    setError('');
    // Simulamos registro exitoso
    console.log({ rut, password, userType });

    alert('Registro exitoso! Ahora inicia sesión.');

    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Registrarse – InmoCloud</title>
      </Head>
      <NavigationBar />
      <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh', backgroundColor: '#f5f6f7' }}>
        <Row>
          <Col md={12}>
            <div className="p-5 shadow rounded bg-white" style={{ minWidth: '300px', maxWidth: '400px' }}>
              <h3 className="text-center mb-4" style={{ color: '#2c3e50' }}>Registrarse</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formRut">
                  <Form.Label>RUT</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: 12.345.678-K"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
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

                <Form.Group className="mb-3" controlId="formUserType">
                  <Form.Label>Tipo de usuario</Form.Label>
                  <Form.Select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                  >
                    <option value="arrendatario">Arrendatario</option>
                    <option value="arrendador">Arrendador</option>
                    <option value="administrador">Administrador</option>
                  </Form.Select>
                </Form.Group>

                {error && <Alert variant="danger">{error}</Alert>}

                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Registrarse
                </Button>

                <div className="text-center mt-3">
                  <a href="/login" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    ¿Ya tienes una cuenta? Inicia sesión
                  </a>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
