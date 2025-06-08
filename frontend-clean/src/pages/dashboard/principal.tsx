'use client'
import Head from 'next/head';
import NavigationBar from '@/features/common/components/NavigationBar';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { FaHome, FaUsers, FaMoneyBillWave, FaBell } from 'react-icons/fa';
import { dashboard_metrics_t, dashboard_response_schema } from '@/backend/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';



export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<dashboard_metrics_t>();

  useEffect(() => {
    fetch('/api/dashboard', { headers: {'authorization': `Bearer ${localStorage.getItem('token') || ""}`}   })
      .then(res => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then(json => {
        if (!json) return;
        const parsed = dashboard_response_schema.safeParse(json);
        if (!parsed.success || !parsed.data.data) {
          router.push('/login');
          return;
        }
        setData(parsed.data.data);
      });
  }, []);

  if (!data) return       <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>;
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
                  {data.propiedadesActivas}
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
                  {data.inquilinos}
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
                  {data.propiedadesEnArriendo}
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
                {data.pagosAtrasados > 0 ? (
                  <p>
                    <Badge bg="danger" pill>
                      {data.pagosAtrasados}
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
