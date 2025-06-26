import { useAuth } from "@/context/AuthContext";
import NavigationBar from "@/features/common/components/NavigationBar";
import { fetchProperties } from "@/services/properties";
import { fetchUserList } from "@/services/user";
import { property_view_t, user_union_t } from "@/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container, Spinner, Table } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export default function PropiedadesView () {

  const router = useRouter();
  const property_id = router.query.id;
  const [propertyData, setPropertyData] = useState<property_view_t | null>(null);
  const [ownerData, setOwnerData] = useState<user_union_t | null>(null);
  const [tenantData, setTenantData] = useState<user_union_t| null>(null);

  const auth = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const parsedId = Number(property_id);
      if (!parsedId) return;

      /* 1️⃣ Propiedad */
      const propertyRes = await fetchProperties(token, { id: parsedId });
      const property = propertyRes[0];
      setPropertyData(property);

      /* 2️⃣ Propietario */
      const ownerRes = await fetchUserList(token, { id: property.propietario_id });
      setOwnerData(ownerRes[0]);

      /* 3️⃣ Arrendatario (si existe) */
      if (property.arrendatario_id) {
        const tenantRes = await fetchUserList(token, { id: property.arrendatario_id });
        setTenantData(tenantRes[0]);
      }
    };

    if (property_id) fetchData();
  }, [router, property_id]);
  
  if (!propertyData || !ownerData) {
    return (
      <>
        <NavigationBar />
        <Container className="mt-5 text-center">
          <Spinner animation="border" />
          <p className="mt-3">Cargando información de la propiedad…</p>
        </Container>
      </>
    );
  }

  /* Render */
  return (
    <>
      <NavigationBar />
      <Container className="mt-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <FaArrowLeft style= {{
            backgroundColor:"#eee",
            borderRadius: "10px",
            padding:      "5px",
            width:        "30px",
            height:       "auto",
            cursor:       "pointer"
          }} onClick = {() => {router.back()}} /> 
          <h2>Propiedad Rol {propertyData.rol}</h2>
        </div>

        {/* Detalle Propiedad */}
        <h4>Detalle de la Propiedad</h4>
        <Table striped bordered hover>
          <tbody>
            <tr><th>Dirección</th><td>{propertyData.direccion}</td></tr>
            <tr><th>Valor</th><td>${propertyData.valor.toLocaleString()}</td></tr>
            <tr><th>Activa</th><td>{propertyData.activa ? "Sí" : "No"}</td></tr>
            <tr><th>Arrendada</th>
              <td>{propertyData.arrendatario_id ? "Sí" : "No"}</td></tr>
            <tr><th>Fecha Arriendo</th>
              <td>{propertyData.fecha_arriendo
                ? new Date(propertyData.fecha_arriendo).toLocaleDateString()
                : "—"}</td></tr>
          </tbody>
        </Table>

        {/* Propietario */}
        <h4 className="mt-4">Propietario</h4>
        <Table striped bordered hover>
          <tbody>
            <tr><th>Nombre</th><td>{ownerData.nombre} {ownerData.apellidos}</td></tr>
            <tr><th>RUT</th><td>{ownerData.rut}</td></tr>
            <tr><th>Teléfono</th><td>{ownerData.telefono || "—"}</td></tr>
            <tr><th>Correo</th><td>{ownerData.mail || "—"}</td></tr>
          </tbody>
        </Table>

        {/* Arrendatario (solo si existe) */}
        {tenantData && (
          <>
            <h4 className="mt-4">Arrendatario</h4>
            <Table striped bordered hover>
              <tbody>
                <tr><th>Nombre</th><td>{tenantData.nombre} {tenantData.apellidos}</td></tr>
                <tr><th>RUT</th><td>{tenantData.rut}</td></tr>
                <tr><th>Teléfono</th><td>{tenantData.telefono || "—"}</td></tr>
                <tr><th>Correo</th><td>{tenantData.mail || "—"}</td></tr>
              </tbody>
            </Table>
          </>
        )}
      </Container>
    </>
  );
}
