import { useAuth } from "@/context/AuthContext";
import NavigationBar from "@/features/common/components/NavigationBar";
import { fetchPayments } from "@/services/payments";
import { fetchProperties } from "@/services/properties";
import { fetchUserList } from "@/services/user";
import {
    payment_view_t,
    property_view_t,
    Roles,
    user_union_t
} from "@/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container, Spinner, Table } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export default function UserDetail() {
    const router = useRouter();
    const { id: user_id } = router.query;

    const [userData, setUserData] = useState<user_union_t | null>(null);
    const [propertiesData, setPropertiesData] = useState<property_view_t[]>([]);
    const [paymentsData, setPaymentsData] = useState<payment_view_t[]>([]);
    const [loading, setLoading] = useState(true);

    const auth = useAuth();

    /* ────────────────────────────────────────────── */
    /* Fetch everything once tenemos el user_id      */
    /* ────────────────────────────────────────────── */
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const parsedId = Number(user_id);
            if (!parsedId) return;

            /* 1️⃣ Usuario */
            const userRes = await fetchUserList(token, { id: parsedId });
            const user = userRes[0];
            setUserData(user);

            /* 2️⃣ Propiedades según rol */
            let propsRes: property_view_t[] = [];
            if (user.role === Roles.PROPIETARIO) {
                propsRes = await fetchProperties(token, { propietario_id: user.id });
            } else if (user.role === Roles.ARRENDATARIO) {
                propsRes = await fetchProperties(token, { arrendatario_id: user.id });
            }
            setPropertiesData(propsRes);

            /* 3️⃣ Pagos */
            const paysRes = await fetchPayments(token, { usuario_id: user.id });
            setPaymentsData(paysRes);

            setLoading(false);
        };

        if (user_id) fetchData();
    }, [user_id, router]);

    /* ────────────────────────────────────────────── */
    /* Loading spinner                               */
    /* ────────────────────────────────────────────── */
    if (loading) {
        return (
            <>
                <NavigationBar />
                <Container className="mt-5 text-center">
                    <Spinner animation="border" />
                    <p className="mt-3">Cargando información del cliente…</p>
                </Container>
            </>
        );
    }

    if (!userData) return null; // safety net

    /* ────────────────────────────────────────────── */
    /* Helpers                                       */
    /* ────────────────────────────────────────────── */
    const formatDate = (d: Date | string) =>
        new Date(d).toLocaleDateString("es-CL");

    /* ────────────────────────────────────────────── */
    /* JSX                                           */
    /* ────────────────────────────────────────────── */
    return (
        <>
            <NavigationBar />
            <Container className="mt-5">
                {/* Back button & header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                    <FaArrowLeft
                        style={{
                            backgroundColor: "#eee",
                            borderRadius: "10px",
                            padding: "5px",
                            width: "30px",
                            height: "auto",
                            cursor: "pointer"
                        }}
                        onClick={() => router.back()}
                    />
                    <h2>Ficha de usuario</h2>
                </div>

                {/* 1️⃣ Tabla Usuario */}
                <h4>Información del usuario</h4>
                <Table striped bordered hover>
                    <tbody>
                        <tr>
                            <th>Nombre</th>
                            <td>{`${userData.nombre} ${userData.apellidos}`}</td>
                        </tr>
                        <tr>
                            <th>RUT</th>
                            <td>{userData.rut}</td>
                        </tr>
                        <tr>
                            <th>Rol</th>
                            <td>{userData.role}</td>
                        </tr>
                        <tr>
                            <th>Teléfono</th>
                            <td>{userData.telefono || "—"}</td>
                        </tr>
                        <tr>
                            <th>Correo</th>
                            <td>{userData.mail || "—"}</td>
                        </tr>
                    </tbody>
                </Table>

                {/* 2️⃣ Tabla Propiedades */}

                {/* PROPIETARIO: resumen de todas */}
                {userData.role === Roles.PROPIETARIO && (
                    <>
                        <h4 className="mt-4">Propiedades</h4>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Rol</th>
                                    <th>Dirección</th>
                                    <th>Valor</th>
                                    <th>Activa</th>
                                    <th>Arrendada</th>
                                    <th>Fecha Arriendo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {propertiesData.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.rol}</td>
                                        <td>{p.direccion}</td>
                                        <td>${p.valor.toLocaleString()}</td>
                                        <td>{p.activa ? "Sí" : "No"}</td>
                                        <td>{p.arrendatario_id ? "Sí" : "No"}</td>
                                        <td>
                                            {p.fecha_arriendo ? formatDate(p.fecha_arriendo) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                )}

                {/* ARRENDATARIO: solo la primera (debería haber solo una) */}
                {userData.role === Roles.ARRENDATARIO && propertiesData[0] && (
                    <>
                        <h4 className="mt-4">Propiedad en arriendo</h4>
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <th>Rol</th>
                                    <td>{propertiesData[0].rol}</td>
                                </tr>
                                <tr>
                                    <th>Dirección</th>
                                    <td>{propertiesData[0].direccion}</td>
                                </tr>
                                <tr>
                                    <th>Valor</th>
                                    <td>${propertiesData[0].valor.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <th>Fecha Arriendo</th>
                                    <td>
                                        {propertiesData[0].fecha_arriendo
                                            ? formatDate(propertiesData[0].fecha_arriendo)
                                            : "—"}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </>
                )}

                {propertiesData.length === 0 && (
                    <p className="text-muted">No existen propiedades asociadas.</p>
                )}

                {/* 3️⃣ Tabla Pagos */}
                <h4 className="mt-4">Pagos</h4>
                {paymentsData.length > 0 ? (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Categoría</th>
                                <th>Monto</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentsData.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{formatDate(p.fecha)}</td>
                                    <td>{p.categoria}</td>
                                    <td>${p.monto.toLocaleString()}</td>
                                    <td>{p.detalle || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <p className="text-muted">No existen pagos registrados.</p>
                )}
            </Container>
        </>
    );
}