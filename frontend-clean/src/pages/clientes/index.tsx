import NavigationBar from "@/features/common/components/NavigationBar";
import { Container, Modal, Button } from "react-bootstrap";
import { TablaPropiedades } from "@/features/dashboard/propiedades/components/TablaPropiedades";
import PropertyModal from "@/features/dashboard/propiedades/components/PropertyModal";
import { useEffect, useState } from "react";
import { property_view_t, property_form_add_t, property_form_edit_t, property_form_arrendatario_t, report_view_t, token_t } from "@/types";
import { asignarArrendatario, createProperty, deleteProperty, editProperty } from "@/services/properties";
import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import { createUser } from "@/services/user";
import ArrendatarioModal from "@/features/dashboard/propiedades/components/ArrendatarioModal";
import TimedAlerts from "@/features/common/components/TimedAlerts";
import { useReport } from "@/features/dashboard/reportes/hooks/useReportes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ReportsTable } from "@/features/dashboard/reportes/components/ReportsTable";
import { jwtDecode } from "jwt-decode";

export default function ReportesPage() {
  const reportes = useReport();
  const auth = useAuth();
  const router = useRouter();
  const [selId, setSelId] = useState(-1);

  const [userId, setUserId] = useState<number | null>(null);


  // Handler: View report details (navigate or show modal)
  const handleViewReport = (report: report_view_t) => {
    router.push(`/api/reports/${report.id}`);
  };



  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const tokenData: token_t = jwtDecode(token);
      if (tokenData?.id) setUserId(tokenData.id);
    } catch (err) {
      console.error("Invalid token", err);
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (userId !== undefined && userId !== null) reportes.refresh(userId);
  }, [userId]);

  useEffect(() => {
    console.log(reportes.reports)
  }, [reportes.reports])
  return (
    <>
      <NavigationBar />
      
      <Container className="mt-5">
        <h2 className="mb-4">Reportes</h2>
        <ReportsTable
          reports= {reportes.reports}
          onView={handleViewReport}
          setSelId={setSelId}
          onDelete={()=>{}}
          />
      </Container>
    
    </>
  );
}
