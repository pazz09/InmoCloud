import { useState, useEffect } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useUserList } from "../../usuarios/hooks/useUserList";

interface ReporteModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (userId: number) => Promise<void>;
}

export default function ReporteModal({ show, onClose, onSubmit }: ReporteModalProps) {
  const { users, loading } = useUserList();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Reset state on open
    if (show) {
      setSelectedUserId(null);
      setFormError(null);
    }
  }, [show]);

  const handleSubmit = async () => {
    if (!selectedUserId || selectedUserId <= 0) {
      setFormError("Debe seleccionar un usuario para el reporte.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await onSubmit(selectedUserId);
      onClose(); // Optionally close modal after submit
    } catch (err) {
      console.log(err)
      setFormError("Error generando el reporte.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Generar Reporte</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Usuario</Form.Label>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <Form.Select
                value={selectedUserId ?? ""}
                onChange={e => setSelectedUserId(Number(e.target.value))}
                isInvalid={!!formError}
              >
                <option value="">Seleccione un usuario</option>
                {users?.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nombre} {user.apellidos}
                  </option>
                ))}
              </Form.Select>
            )}
            <Form.Control.Feedback type="invalid">{formError}</Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Spinner animation="border" size="sm" /> : "Generar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
