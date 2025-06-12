import NavigationBar from "@/features/common/components/NavigationBar";
import { Container, Modal, Button, Toast, Form } from "react-bootstrap";
import { PaymentsTable } from "@/features/dashboard/banco/components/PaymentsTable"
import { useBanco } from "@/features/dashboard/banco/hooks/useBanco"
import { useEffect, useState } from "react";
import { payment_form_data_schema, payment_form_data_t, payment_view_t } from "@/types";
import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import PaymentModal from "@/features/dashboard/banco/components/PaymentModal";
import { createPayment } from "@/services/payments";
import { AppError } from "@/utils/errors";
import TimedAlerts from "@/features/common/components/TimedAlerts";

export default function DashboardBancoPage() {
  const banco = useBanco();

  const [showModal, setShowModal] = useState(false);
  const [editing, setIsEditing] = useState(false);

  const [modalMode, setModalMode] = useState<"view" | "edit" | "delete" | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<payment_view_t | null>(null);

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [newMonto, setNewMonto] = useState("");


  const { visibleAlerts, addError, addSuccess } = useTimedAlerts(5);

  useEffect(() => {
    console.log("xd")

  }, [showModal]);

  const onSubmit = async (pago: payment_form_data_t) => {
    console.log("On Submit 2");
    const token = localStorage.getItem("token")
    try {
      const res = await createPayment(pago, token!);
      console.log("2: res", res)
      addSuccess("Los datos de ingresaron exitosamente");
      setShowModal(false);
      banco.refresh();
    } catch (err) {
      addError((err as AppError).message);
    }
  }

  

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
          onSubmit={onSubmit}
          editing = {editing}
    /> 
    <TimedAlerts alerts= {visibleAlerts} onDismiss={()=>{}}/>


  </>)

}
