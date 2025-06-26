import { Dispatch, SetStateAction } from "react";
import { Button, Modal } from "react-bootstrap";

type DeletePaymentPopupProps = {
  showConfirm: boolean,
  setShowConfirm: Dispatch<SetStateAction<boolean>> ,
  handleConfirm: () => Promise<void>
}

export default function DeletePaymentPopup(props: DeletePaymentPopupProps) {
  const { showConfirm, setShowConfirm, handleConfirm } = props;
  return (
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
  );
}
