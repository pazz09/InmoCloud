import Link from 'next/link';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';

export default function NavigationBar() {
  const { isAuthenticated, logout } = useAuth(); // 👈 incluir logout

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} href="/">
          InmoCloud
        </Navbar.Brand>

        {isAuthenticated ? (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Link href="/propiedades" className="nav-link">Propiedades</Link>
                <Link href="/usuarios" className="nav-link">Usuarios</Link>
                <Link href="/pagos" className="nav-link">Pagos</Link>
                <Link href="/reportes" className="nav-link">Reportes</Link>
              </Nav>
              <Nav>
                <Nav.Link /*onClick={logout}*/ style={{ cursor: 'pointer' }}>
                  Cerrar sesión
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </>
        ) : null}
      </Container>
    </Navbar>
  );
}
