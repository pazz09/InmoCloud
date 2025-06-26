import { useAuth } from "@/context/AuthContext";
import NavigationBar from "@/features/common/components/NavigationBar";
import { fetchPayments } from "@/services/payments";
import { fetchProperties } from "@/services/properties";
import { fetchUserList } from "@/services/user";
import { payment_view_t, property_view_t, user_t, user_union_t, users_list_t } from "@/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container, Spinner, Table } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export default function () {

  const router = useRouter();
  const payment_id = router.query.id;
  const [paymentData, setPaymentData] = useState<payment_view_t| null>(null);
  const [propertyData, setPropertyData] = useState<property_view_t | null>(null);
  const [userData, setUserData] = useState<user_union_t | null>(null);

  const auth = useAuth();

  useEffect(() => {
    const fn = async () => {
      const token = localStorage.getItem("token");
      if (!token) router.push("/login");

      const parsed_payment_id = Number.parseInt(payment_id as string);
      if (!parsed_payment_id) return;

      const payment_data = await fetchPayments(token!, { id: parsed_payment_id });
      const payment = payment_data[0];
      setPaymentData(payment);

      if (payment?.propiedad_id) {
        const property_data = await fetchProperties(token!, { id: payment.propiedad_id });
        setPropertyData(property_data[0]);
      }

      const user_data = await fetchUserList(token!, { id: payment.usuario_id });
      setUserData(user_data[0]);
    };
    fn();
  }, [router, payment_id]);

  if (!paymentData || !userData) {
    return (
      <>
        <NavigationBar />
        <Container className="mt-5 text-center">
          <Spinner animation="border" />
          <p className="mt-3">Cargando información del pago...</p>
        </Container>
      </>
    );
  }
  
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
          <h2>Pago Nº {paymentData.id}</h2>
        </div>

        <h4>Detalle del Pago</h4>
        <Table striped bordered hover>
          <tbody>
            <tr><th>Fecha</th><td>{new Date(paymentData.fecha).toLocaleDateString()}</td></tr>
            <tr><th>Tipo</th><td>{paymentData.tipo ? "Ingreso" : "Egreso"}</td></tr>
            <tr><th>Monto</th><td>${paymentData.monto.toLocaleString()}</td></tr>
            <tr><th>Pagado</th><td>{paymentData.pagado ? "Sí" : "No"}</td></tr>
            <tr><th>Categoría</th><td>{paymentData.categoria}</td></tr>
            <tr><th>Cliente</th><td>{paymentData.cliente}</td></tr>
            <tr><th>Detalle</th><td>{paymentData.detalle || "—"}</td></tr>
          </tbody>
        </Table>

        <h4 className="mt-4">Usuario Asociado</h4>
        <Table striped bordered hover>
          <tbody>
            <tr><th>Nombre</th><td>{userData.nombre} {userData.apellidos}</td></tr>
            <tr><th>RUT</th><td>{userData.rut}</td></tr>
            <tr><th>Rol</th><td>{userData.role}</td></tr>
            <tr><th>Teléfono</th><td>{userData.telefono || "—"}</td></tr>
            <tr><th>Correo</th><td>{userData.mail || "—"}</td></tr>
          </tbody>
        </Table>

        {propertyData && (
          <>
            <h4 className="mt-4">Propiedad Asociada</h4>
            <Table striped bordered hover>
              <tbody>
                <tr><th>Rol</th><td>{propertyData.rol}</td></tr>
                <tr><th>Dirección</th><td>{propertyData.direccion}</td></tr>
                <tr><th>Valor</th><td>${propertyData.valor.toLocaleString()}</td></tr>
                <tr><th>Activa</th><td>{propertyData.activa ? "Sí" : "No"}</td></tr>
                <tr><th>Propietario</th><td>{propertyData.propietario}</td></tr>
                <tr><th>Arrendatario</th><td>{propertyData.arrendatario || "—"}</td></tr>
                <tr>
                  <th>Fecha Arriendo</th>
                  <td>
                    {propertyData.fecha_arriendo
                      ? new Date(propertyData.fecha_arriendo).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </Table>
          </>
        )}
      </Container>
    </>
  );
}
