import { useAuth } from "@/context/AuthContext";
import NavigationBar from "@/features/common/components/NavigationBar";
import { fetchUserList } from "@/services/user";
import { user_union_t } from "@/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container, Spinner, Table } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export default function UserDetail() {
    const router = useRouter();
    const { id: user_id } = router.query;

    const [userData, setUserData] = useState<user_union_t | null>(null);
    const [loading, setLoading] = useState(true);

    const auth = useAuth();

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
                    <p className="mt-3">Cargando información del usuario…</p>
                </Container>
            </>
        );
    }

    if (!userData) return null; // safety net

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
            </Container>
        </>
    );
}