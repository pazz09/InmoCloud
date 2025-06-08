'use client';
import Link from 'next/link';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { UserRoleEnum } from '@/backend/types';
import { useEffect, useState } from 'react';

export default function NavigationBar() {
  const { isAuthenticated, role, logout } = useAuth(); // 👈 incluir logout
  const router = useRouter();
  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar el componente
    if (!isAuthenticated ) {
      // Si no está autenticado, redirigir a la página de inicio de sesión
       router.push('/login');
    }
  }, [isAuthenticated, router]);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar si el usuario es administrador
    if (role === UserRoleEnum.ADMINISTRADOR) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [role]);


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

                <Link href="/dashboard/banco" className="nav-link">Banco</Link>

                <Link href="/dashboard/clientes" className="nav-link">Clientes</Link>
                {isAdmin && (<Link href="/dashboard/usuarios" className="nav-link">Usuarios</Link>)}

                <Link href="/propiedades" className="nav-link">Propiedades</Link>

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
