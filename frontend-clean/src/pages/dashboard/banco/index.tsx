import NavigationBar from "@/features/common/components/NavigationBar";
import { Container, Modal, Button, Toast, Form } from "react-bootstrap";
import { PaymentsTable } from "@/features/dashboard/banco/components/PaymentsTable"
import { useBanco } from "@/features/dashboard/banco/hooks/useBanco"
import { useEffect, useState } from "react";
import { payment_view_t } from "@/types";
import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import PaymentModal from "@/features/dashboard/banco/components/PaymentModal";

export default function DashboardBancoPage() {
  const banco = useBanco();

  const [showModal, setShowModal] = useState(false);
  const [editing, setIsEditing] = useState(false);

  const [modalMode, setModalMode] = useState<"view" | "edit" | "delete" | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<payment_view_t | null>(null);

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [newMonto, setNewMonto] = useState("");

  const { addError, addSuccess } = useTimedAlerts(5);

  useEffect(() => {
    console.log("xd")

  }, [showModal]);

  

  const handleAction = (mode: "view" | "edit" | "delete", payment: payment_view_t) => {
    setSelectedPayment(payment);
    setModalMode(mode);
    //setNewMonto(payment.deposito?.toString() || "");
    setShowModal(true);
  };


    function handleConfirm(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
      setShowModal(true);
    }

  return (<>
    <NavigationBar/>
    <Container className="mt-5">
        <h2 className="mb-4">Lista de Pagos</h2>
        <PaymentsTable
          payments={banco.pagos}

          onAdd={()=> {setShowModal(true)}}
          onView={(p) => handleAction("view", p)}
          onEdit={(p) => handleAction("edit", p)}
          onDelete={(p) => handleAction("delete", p)}
        />

    </Container>
    <PaymentModal 
          show = {showModal} 
          onClose = { () => {setShowModal(false)}}
          onSubmit={()=> {}}
          editing = {editing}
    /> 

    {/* 
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "view" && "Detalles del Pago"}
            {modalMode === "edit" && "Editar Monto del Pago"}
            {modalMode === "delete" && "Eliminar Pago"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMode === "view" && selectedPayment && (
            <>
              <p><strong>ID:</strong> {selectedPayment.id}</p>
              <p><strong>Cliente:</strong> {selectedPayment.cliente}</p>
              <p><strong>Monto:</strong> {selectedPayment.deposito}</p>
              <p><strong>Detalle:</strong> {selectedPayment.detalle}</p>
            </>
          )}

          {modalMode === "edit" && (
            <Form.Group controlId="montoEdit">
              <Form.Label>Nuevo monto</Form.Label>
              <Form.Control
                type="number"
                value={newMonto}
                onChange={(e) => setNewMonto(e.target.value)}
              />
            </Form.Group>
          )}

          {modalMode === "delete" && (
            <p>¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          {modalMode !== "view" && (
            <Button
              variant={modalMode === "delete" ? "danger" : "primary"}
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    */}

  </>)

}
