import NavigationBar from "@/features/common/components/NavigationBar";
import { Container } from "react-bootstrap";
import { PaymentsTable } from "@/features/dashboard/banco/components/PaymentsTable"
import { useBanco } from "@/features/dashboard/banco/hooks/useBanco"
import { useEffect, useState } from "react";
import axios from "axios";
import { payment_view_t } from "@/types";

export default function DashboardBancoPage() {
  const banco = useBanco();

  return (<>
    <NavigationBar/>
    <Container className="mt-5">
        <h2 className="mb-4">Lista de Pagos</h2>
        <PaymentsTable {...{payments: banco.pagos}}/>

    </Container>
  </>)

}
