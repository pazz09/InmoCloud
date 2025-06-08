import NavigationBar from "@/features/common/components/NavigationBar";
import { Container } from "react-bootstrap";
import { PaymentsTable } from "@/features/dashboard/banco/components/PaymentsTable"
import { useBanco } from "@/features/dashboard/banco/hooks/useBanco"

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
