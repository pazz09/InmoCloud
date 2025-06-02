import Link from 'next/link';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function NavigationBar() {
  const { isAuthenticated, logout } = useAuth(); // 👈 incluir logout
  const router = useRouter();

  const logOutHandler = () => {
    localStorage.removeItem('token');
    logout(); // optional: update auth context
    router.push('/login');
  }

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
                <Link href="/dashboard/usuarios" className="nav-link">Usuarios</Link>
                <Link href="/pagos" className="nav-link">Pagos</Link>
                <Link href="/reportes" className="nav-link">Reportes</Link>
              </Nav>
              <Nav>
                <Nav.Link onClick={logOutHandler} style={{ cursor: 'pointer' }}>
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
