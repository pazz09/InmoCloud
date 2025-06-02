'use client';

import Head from 'next/head';
import NavigationBar from '@/components/Navbar';
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Modal,
  Form,
} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';

// Schema and type
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  rut: z.string(),
  role: z.string(),
});
const usersResponseSchema = z.array(userSchema);
type User = z.infer<typeof userSchema>;

export default function UsersDashboard() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState({ name: '', rut: '', role: '' });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    })
      .then(res => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then(json => {
        const parsed = usersResponseSchema.safeParse(json);
        if (!parsed.success) {
          setError('Error al validar los datos de usuarios.');
          return;
        }
        setUsers(parsed.data);
      })
      .catch(err => setError(err.message));
  }, []);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormValues({ name: user.name, rut: user.rut, role: user.role });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!selectedUser) return;

    // You'd call PUT /api/users/:id here
    console.log('Saving updated user:', {
      ...selectedUser,
      ...formValues,
    });

    // Simulate update in local state
    setUsers(users =>
      users?.map(u =>
        u.id === selectedUser.id ? { ...u, ...formValues } : u
      ) || null
    );

    handleModalClose();
  };

  const handleDelete = (userId: number) => {
    // You'd call DELETE /api/users/:id here
    console.log('Deleting user with ID:', userId);

    setUsers(users => users?.filter(u => u.id !== userId) || null);
  };

  return (
    <>
      <Head>
        <title>Usuarios – InmoCloud</title>
      </Head>
      <NavigationBar />
      <Container className="mt-5">
        <h2 className="mb-4 text-center" style={{ color: '#2c3e50' }}>
          Lista de Usuarios
        </h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {!users && !error && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        )}

        {users && (
          <div className="table-responsive">
            <Table bordered hover striped className="shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.rut}</td>
                    <td>{user.role}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditClick(user)}
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        🗑️ Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      {/* Edit User Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formRut" className="mb-3">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={formValues.rut}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formRole" className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Control
                type="text"
                name="role"
                value={formValues.role}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

