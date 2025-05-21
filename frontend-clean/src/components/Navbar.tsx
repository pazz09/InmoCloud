import Link from 'next/link';
import { Navbar, Nav, Container } from 'react-bootstrap';

export default function NavigationBar() {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Link href="/" className="navbar-brand">
          InmoCloud
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link href="/propiedades" className="nav-link">Propiedades</Link>
            <Link href="/usuarios" className="nav-link">Usuarios</Link>
            <Link href="/pagos" className="nav-link">Pagos</Link>
            <Link href="/reportes" className="nav-link">Reportes</Link>
            <Link href="/login" className="nav-link">Iniciar sesión</Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
