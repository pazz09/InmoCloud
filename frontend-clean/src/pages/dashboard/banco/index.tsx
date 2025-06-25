import NavigationBar from "@/features/common/components/NavigationBar";
import { Container, Modal, Button, Toast, Form } from "react-bootstrap";
import { PaymentsTable } from "@/features/dashboard/banco/components/PaymentsTable"
import { useBanco } from "@/features/dashboard/banco/hooks/useBanco"
import { useEffect, useState } from "react";
import { payment_form_data_schema, payment_form_data_t, payment_view_t } from "@/types";
import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import PaymentModal from "@/features/dashboard/banco/components/PaymentModal";
import { createPayment, deletePayment, editPayment } from "@/services/payments";
import { AppError } from "@/utils/errors";
import TimedAlerts from "@/features/common/components/TimedAlerts";
import z from "zod";
import { useRouter } from "next/router";
import PaymentsSearchBar from "@/features/dashboard/banco/components/PaymentsSearchBar";

const payment_form_data_input_schema = payment_form_data_schema.extend({ fecha: z.string() });
type payment_form_data_input_t = z.infer<typeof payment_form_data_input_schema>;

export default function DashboardBancoPage() {
  const banco = useBanco();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editing, setIsEditing] = useState(false);

  const [modalMode, setModalMode] = useState<"create" | "view" | "edit" | "delete" | null>(null);
  const [selectedPayment, setSelectedPayment] = useState(-1);

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [newMonto, setNewMonto] = useState("");


  const { visibleAlerts, addError, addSuccess } = useTimedAlerts();

  useEffect(() => {
    console.log("xd")

  }, [showModal]);

  const onSubmit = async (pago: payment_form_data_t) => {
    console.log("On Submit 2");
    const token = localStorage.getItem("token")
    try {
      if (!editing) {
        const res = await createPayment(pago, token!);
        addSuccess("Los datos se ingresaron exitosamente");
        console.log("2: res", res)
      } else {
        const res = await editPayment(selectedPayment, pago, token!);
        addSuccess("Los datos se editaron exitosamente");
        console.log("2: res", res)

      }
      setShowModal(false);
      banco.refresh();
    } catch (err) {
      console.log(err)
      addError((err as AppError).message);
    }
  }

  useEffect(()=> {
    console.log(editing) ;
  }, [editing])



  const handleAction = (mode: "create" | "view" | "edit" | "delete", payment: payment_view_t) => {
    console.log("payment handle", payment)
    setSelectedPayment(payment.id);
    const convert = payment_form_data_input_schema.parse({
      ...payment,
      fecha: `${payment.fecha.getFullYear()}-${String(payment.fecha.getMonth() + 1).padStart(2, '0')}-${String(payment.fecha.getDate()).padStart(2, '0')}`
    }); setModalMode(mode);

    resetForm();
    if (mode === "edit") {
      setIsEditing(true);
      setFormValues(convert);
      setShowModal(true);
    } else if (mode === "delete") {
      setShowConfirm(true);
    } else  {
    setIsEditing(false);
    setShowModal(true);
    }
    //setNewMonto(payment.deposito?.toString() || "");
    
  };


  async function handleConfirm(): Promise<void> {
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      router.push("/login")
      return;
    }

    // Lógica de confirmación aquí
    try {
      await deletePayment(selectedPayment!, token);
      addSuccess("Pago eliminada con éxito");
      banco.refresh();
      setShowConfirm(false);
    } catch (e) {
      console.log("Error al eliminar pago:", e);
      addError(
        `Error al eliminar pago: ${
         "Error desconocido"
        }`
      )
    } finally {
      console.log("Deleting property:", selectedPayment!);
      setShowModal(false);
    }
  }



  const [formValues, setFormValues] = useState<payment_form_data_input_t>({
    fecha: "",
    tipo: false,
    monto: 0,
    pagado: false,
    categoria: "CAT_A",
    detalle: "",
    usuario_id: -1,
    propiedad_id: -1,
  });

  const resetForm = () => setFormValues({
    fecha: "",
    tipo: false,
    monto: 0,
    pagado: false,
    categoria: "CAT_A",
    detalle: "",
    usuario_id: -1,
    propiedad_id: -1,
  })

  return (<>
    <NavigationBar />
    <Container className="mt-5">
      <h2 className="mb-4">Lista de Pagos</h2>
      <PaymentsSearchBar/>
      <PaymentsTable
        payments={banco.pagos}

        onAdd={() => { resetForm(); setIsEditing(false); setShowModal(true) }}
        onView={(p) => router.push(`/dashboard/banco/${p.id}`)}
        onEdit={(p) => handleAction("edit", p)}
        onDelete={(p) => handleAction("delete", p)}
      />

      <TimedAlerts alerts={visibleAlerts} onDismiss={() => { }} />
      <PaymentModal
        show={showModal}
        onClose={() => { setShowModal(false) }}
        onSubmit={onSubmit}
        editing={editing}
        initialFormValues={formValues}
      />

      { showConfirm && (
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

      )}

    </Container>


  </>)

}
