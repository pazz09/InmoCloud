import Head from 'next/head';
import NavigationBar from '@/components/Navbar';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaHome, FaUsers, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa';

export default function Home() {
  return (
    <>
      <Head>
        <title>Inicio – InmoCloud</title>
      </Head>
      <NavigationBar />
      <Container className="mt-5">
        <h2 className="mb-4 text-center" style={{ color: '#2c3e50' }}>
          Bienvenida a InmoCloud
        </h2>
        <p className="text-center text-muted mb-5">
          Selecciona un módulo para comenzar
        </p>
        <Row className="g-4">
          <Col md={6} lg={3}>
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body>
                <FaHome size={40} className="mb-3 text-primary" />
                <Card.Title>Propiedades</Card.Title>
                <Card.Text>Administra propiedades registradas.</Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <a href="/propiedades" className="btn btn-outline-primary w-100">
                  Ir
                </a>
              </Card.Footer>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body>
                <FaUsers size={40} className="mb-3 text-primary" />
                <Card.Title>Usuarios</Card.Title>
                <Card.Text>Gestiona propietarios, arrendatarios y corredores.</Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <a href="/usuarios" className="btn btn-outline-primary w-100">
                  Ir
                </a>
              </Card.Footer>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body>
                <FaMoneyBillWave size={40} className="mb-3 text-primary" />
                <Card.Title>Pagos</Card.Title>
                <Card.Text>Registra y visualiza los pagos realizados.</Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <a href="/pagos" className="btn btn-outline-primary w-100">
                  Ir
                </a>
              </Card.Footer>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body>
                <FaFileAlt size={40} className="mb-3 text-primary" />
                <Card.Title>Reportes</Card.Title>
                <Card.Text>Genera reportes financieros y de gestión.</Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <a href="/reportes" className="btn btn-outline-primary w-100">
                  Ir
                </a>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
