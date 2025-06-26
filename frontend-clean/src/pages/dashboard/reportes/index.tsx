import NavigationBar from "@/features/common/components/NavigationBar";
import { Container, Button } from "react-bootstrap";
import { ReportsTable } from "@/features/dashboard/reportes/components/ReportsTable";
import { useReport } from "@/features/dashboard/reportes/hooks/useReportes";
import { useRouter } from "next/router";
import { useState } from "react";
import TimedAlerts from "@/features/common/components/TimedAlerts";
import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import { report_view_t } from "@/types";
import DeleteReportPopup from "@/features/dashboard/reportes/components/DeleteReportPopup";
import { deleteReport } from "@/services/reports";
// If you have a ReporteModal for uploading, import here
// import ReporteModal from "@/features/dashboard/reportes/components/ReporteModal";

export default function DashboardReportesPage() {
  const reportes = useReport();
  const router = useRouter();

  const { visibleAlerts, addError, addSuccess } = useTimedAlerts();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selId, setSelId] = useState(-1);

  // Optionally manage a "selected report" for view/delete modals, etc
  // const [selectedReport, setSelectedReport] = useState<report_t | null>(null);

  // Handler: View report details (navigate or show modal)
  const handleViewReport = (report: report_view_t) => {
    router.push(`/api/reports/${report.id}`);
  };


  // Handler: Add new (show upload modal, for example)
  const handleAddReport = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await deleteReport(selId, token)
    console.log(res)
    if(!res.success) {
      addError("Ocurrió un error al eliminar reporte.")

      return 
    } else {
      setShowReportModal(false);
      addSuccess(`Eliminado Reporte N${res.id}`)
      reportes.refresh();
    }
  };

  // Handler: perform upload/creation after modal closes
  // const handleUploadReport = async (userId, file) => { /* ... */ };

  return (
    <>
      <NavigationBar />
      <Container className="mt-5">
        <h2 className="mb-4">Lista de Reportes</h2>
        <div className="d-flex flex-row mb-3 align-items-end justify-content-end gap-2">
          {/* ... you may add filters/buttons here if needed ... */}
          {/* <Button
            variant="primary"
            onClick={() => setShowReportModal(true)}
          >
            Generar Reporte
          </Button> */}
        </div>

        <ReportsTable
          reports={reportes.reports}
          onView={handleViewReport}
          onDelete={() => setShowReportModal(true)}
          setSelId={setSelId}
        />

        <TimedAlerts alerts={visibleAlerts} onDismiss={() => {}} />


        {showReportModal && (
          <DeleteReportPopup
            showConfirm={showReportModal}
            setShowConfirm={setShowReportModal}
            handleConfirm={handleAddReport}
          />
        )} 

      </Container>
    </>
  );
}
