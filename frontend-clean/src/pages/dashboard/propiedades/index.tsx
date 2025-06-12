import NavigationBar from "@/features/common/components/NavigationBar";
import { Container } from "react-bootstrap";
import { TablaPropiedades } from "@/features/dashboard/propiedades/components/TablaPropiedades"
import { usePropiedadesPage } from "@/features/dashboard/propiedades/hooks/usePropiedadesPage"

export default function PropiedadesPage() {
  const { propiedades } = usePropiedadesPage();
  return (<>
<NavigationBar/>
<Container className="mt-5">
  <h2>Tabla Propiedades</h2>
  <TablaPropiedades propiedades={propiedades}/>
</Container>
</>)
}
