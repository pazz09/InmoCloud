'use client';
import { useEffect, useState } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';

interface Propiedad {
  id: number;
  direccion: string;
  comuna: string;
  estado: string; // disponible 
  arrendatario?: string;
}

export default function GestionPropiedades() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/propiedades', {
      headers: {
        'authorization': `Bearer ${localStorage.getItem('token') || ""}`,
      },
    })
      .then(res => {
        if (!res.ok) router.push('/login');
        return res.json();
      })
      .then(json => setPropiedades(json.data || []));
  }, []);

  return (
    <Container className="mt-4">
      <h2>Gestión de Propiedades</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Dirección</th>
            <th>Comuna</th>
            <th>Estado</th>
            <th>Arrendatario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {propiedades.map((prop) => (
            <tr key={prop.id}>
              <td>{prop.direccion}</td>
              <td>{prop.comuna}</td>
              <td>{prop.estado}</td>
              <td>{prop.arrendatario || 'No asignado'}</td>
              <td>
                <Button variant="primary" size="sm">Editar</Button>{' '}
                <Button variant="danger" size="sm">Eliminar</Button>{' '}
                <Button variant="secondary" size="sm">Asignar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
