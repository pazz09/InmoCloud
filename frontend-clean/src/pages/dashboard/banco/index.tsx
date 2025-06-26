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
import DeletePaymentPopup from "@/features/dashboard/banco/components/DeletePaymentPopup";


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "@/utils";
import ReporteModal from "@/features/dashboard/banco/components/ReporteModal";
import { uploadReport } from "@/services/reports";

const payment_form_data_input_schema = payment_form_data_schema.extend({ fecha: z.string() });
type payment_form_data_input_t = z.infer<typeof payment_form_data_input_schema>;

export default function DashboardBancoPage() {
  const banco = useBanco();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editing, setIsEditing] = useState(false);

  const [modalMode, setModalMode] = useState<"create" | "view" | "edit" | "delete" | null>(null);
  const [selectedPayment, setSelectedPayment] = useState(-1);

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [newMonto, setNewMonto] = useState("");


  const { visibleAlerts, addError, addSuccess } = useTimedAlerts();

  /*
  useEffect(() => {
    console.log("xd")

  }, [showModal]);
  */

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


const handleExportPDF = async () => {
  const doc = new jsPDF();
  doc.text("Listado de Pagos", 14, 15);

  const data = banco.pagos.map((p) => [
    formatDate(p.fecha) ?? "",
    p.id        ?? "",
    p.categoria ?? "",
    p.cliente   ?? "",
    p.propiedad ?? "",
    p.detalle   ?? "",
    p.tipo      && p.monto || "",
    p.tipo      && ""      || p.monto,
    p.pagado     ? "Sí" : "No"
  ]);

  const fields = [
    "Fecha",
    "ID",
    "Categoría",
    "Cliente",
    "Propiedad",
    "Detalle",
    "Depósito",
    "Giro",
    "Pagado",
    "Acciones",
  ];

  autoTable(doc, {
    head: [fields.slice(0, -1)],
    body: data,
    startY: 20,
  });

  // Generate a Blob from the PDF
  const pdfBlob = doc.output("blob");

  // Create FormData
  const formData = new FormData();
  formData.append("user_id", "1"); // replace with actual user ID
  formData.append("pdf", pdfBlob, "pagos.pdf");

  // Send it via fetch
  const res = await fetch("/api/reports", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.error("Error uploading PDF");
  } else {
    console.log("PDF uploaded successfully");
  }
};



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

  async function generarReporte(userId: number): Promise<void> {
    const token = localStorage.getItem("token")
    if (!token) return;
    if (userId === -1) return;

    console.log("Generando reporte para usuario n", userId);

    const doc = new jsPDF();
    doc.text("Listado de Pagos", 14, 15);

    const data = banco.pagos.map((p) => [
        formatDate(p.fecha) ?? "",
        p.id        ?? "",
        p.categoria ?? "",
        p.cliente   ?? "",
        p.propiedad ?? "",
        p.detalle   ?? "",
        p.tipo      && p.monto || "",
        p.tipo      && ""      || p.monto,
        p.pagado     ? "Sí" : "No"
    ]);

    const fields = [
      "Fecha",
      "ID",
      "Categoría",
      "Cliente",
      "Propiedad",
      "Detalle",
      "Depósito",
      "Giro",
      "Pagado",
      "Acciones",
    ];

    autoTable(doc, {
      head: [fields.slice(0, -1)],
      body: data,
      startY: 20,
    });

    const pdfBlob = doc.output("blob");
    const file = new File([pdfBlob], "reporte.pdf", { type: "application/pdf" });

    const res = await uploadReport(userId, file, token);
    if (res.status === "success") {
      addSuccess("Reporte generado correctamente");
    }
  }

  return (<>
    <NavigationBar />
    <Container className="mt-5">
      <h2 className="mb-4">Lista de Pagos</h2>

      <div className="d-flex flex-row mb-3 align-items-end justify-content-end  gap-2">
        <PaymentsSearchBar onSearch = {(params) => {banco.handleSearch(params)}}/>
        <Button variant="primary" className="h-50 align-self-end" onClick={() => setShowReportModal(true)} >
          Generar Reporte
        </Button>
      </div>

      <PaymentsTable
        payments={banco.pagos}

        onAdd={() => { resetForm(); setIsEditing(false); setShowModal(true) }}
        onView={(p) => router.push(`/dashboard/banco/${p.id}`)}
        onEdit={(p) => handleAction("edit", p)}
        onDelete={(p) => handleAction("delete", p)}
      />

      <TimedAlerts alerts={visibleAlerts} onDismiss={() => { }} />

      <ReporteModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={generarReporte}
      />

      <PaymentModal
        show={showModal}
        onClose={() => { setShowModal(false) }}
        onSubmit={onSubmit}
        editing={editing}
        initialFormValues={formValues}
      />

      <DeletePaymentPopup 
          showConfirm = {showConfirm}
          setShowConfirm={setShowConfirm}
          handleConfirm={handleConfirm}
      />
    </Container>
  </>)

}
