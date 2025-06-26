'use client';

import { Modal, Button } from 'react-bootstrap';

type ConfirmDeleteModalProps = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  title?: string;
  message?: string;
  confirmText?: string;
};

export default function ConfirmDeleteModal({
  show,
  onClose,
  onConfirm,
  itemName,
  title = "¿Estás seguro?",
  message,
  confirmText = "Eliminar",
}: ConfirmDeleteModalProps) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {message ? (
          <p>{message}</p>
        ) : (
          <p>
            ¿Estás seguro que deseas eliminar al usuario
            <b>{itemName ? ` ${itemName}` : ""}</b>? Esta acción no se puede deshacer.
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
