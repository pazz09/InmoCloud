import Head from 'next/head';
import NavigationBar from '@/components/Navbar';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaHome, FaUsers, FaMoneyBillWave, FaBell } from 'react-icons/fa';

export default function Home() {
  // Datos de ejemplo, luego puedes reemplazarlos con datos reales desde API o contexto
  const propiedadesActivas = 12;
  const inquilinos = 20;
  const propiedadesEnArriendo = 8;
  const pagosAtrasados = 3;

  return (
    <>
      <Head>
        <title>Dashboard – InmoCloud</title>
      </Head>
      <NavigationBar />
      <Container className="mt-5">
        <h2 className="mb-4 text-center" style={{ color: '#2c3e50' }}>
          Bienvenido a InmoCloud
        </h2>

        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center shadow-sm border-0">
              <Card.Body>
                <FaHome size={40} className="mb-3 text-primary" />
                <Card.Title>Propiedades Activas</Card.Title>
                <Card.Text style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {propiedadesActivas}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="text-center shadow-sm border-0">
              <Card.Body>
                <FaUsers size={40} className="mb-3 text-success" />
                <Card.Title>Inquilinos</Card.Title>
                <Card.Text style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {inquilinos}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="text-center shadow-sm border-0">
              <Card.Body>
                <FaMoneyBillWave size={40} className="mb-3 text-warning" />
                <Card.Title>Propiedades en Arriendo</Card.Title>
                <Card.Text style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {propiedadesEnArriendo}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card className="shadow-sm border-0">
              <Card.Header>
                <FaBell size={20} className="me-2 text-danger" />
                <strong>Notificaciones</strong>
              </Card.Header>
              <Card.Body>
                {pagosAtrasados > 0 ? (
                  <p>
                    <Badge bg="danger" pill>
                      {pagosAtrasados}
                    </Badge>{' '}
                    pagos atrasados de inquilinos pendientes.
                  </p>
                ) : (
                  <p>No hay notificaciones pendientes.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}



/*
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
*/