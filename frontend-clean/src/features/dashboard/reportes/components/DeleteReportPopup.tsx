import { Dispatch, SetStateAction } from "react";
import { Button, Modal } from "react-bootstrap";

type DeleteReportPopupProps = {
  showConfirm: boolean,
  setShowConfirm: Dispatch<SetStateAction<boolean>> ,
  handleConfirm: () => Promise<void>
}

export default function DeleteReportPopup(props: DeleteReportPopupProps) {
  const { showConfirm, setShowConfirm, handleConfirm } = props;
  return (
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de eliminar este reporte? Esta acción no se puede deshacer.</p>
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
