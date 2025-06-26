import NavigationBar from "@/features/common/components/NavigationBar";
import { Container, Modal, Button } from "react-bootstrap";
import { TablaPropiedades } from "@/features/dashboard/propiedades/components/TablaPropiedades";
import PropertyModal from "@/features/dashboard/propiedades/components/PropertyModal";
import { useState } from "react";
import { property_view_t, property_form_add_t, property_form_edit_t, property_form_arrendatario_t } from "@/types";
import { asignarArrendatario, createProperty, deleteProperty, editProperty } from "@/services/properties";
import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import { createUser } from "@/services/user";
import ArrendatarioModal from "@/features/dashboard/propiedades/components/ArrendatarioModal";
import TimedAlerts from "@/features/common/components/TimedAlerts";
import { TablaReportes } from "@/features/dashboard/reportes/components/TablaReportes";

export default function ReportesPage() {
  return (
    <>
      <NavigationBar />
      
      <Container className="mt-5">
        <h2 className="mb-4">Reportes</h2>
        <TablaReportes/>
      </Container>
    
    </>
  );
}