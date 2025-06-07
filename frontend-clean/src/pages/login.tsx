import Head from "next/head";
import NavigationBar from "@/components/Navbar";
import { Container, Row, Col } from "react-bootstrap";

import LoginForm from "@/features/login/components/LoginForm";
import { useLogin } from "@/features/login/hooks/useLogin";

import { formatRutInput } from "@/utils/rut";

const LoginPage = () => {
  const {
    rut,
    setRut,
    password,
    setPassword,
    error,
    submitting,
    redirecting,
    handleSubmit,
  } = useLogin();

  return (
    <>
      <Head>
        <title>Iniciar sesión – InmoCloud</title>
      </Head>
      {/* <NavigationBar />  No necesitamos esto en iniciar sesión )? */}
      <Container
        fluid
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "90vh", backgroundColor: "#f5f6f7" }}
      >
        <Row>
          <Col md={12}>
            <div
              className="p-5 shadow rounded bg-white"
              style={{ minWidth: "300px", maxWidth: "400px" }}
            >
              <h3 className="text-center mb-4" style={{ color: "#2c3e50" }}>
                Iniciar sesión
              </h3>
              <LoginForm
                rut={rut}
                password={password}
                error={error}
                submitting={submitting}
                redirecting={redirecting}
                onRutChange={(val) => setRut(formatRutInput(val))}
                onPasswordChange={setPassword}
                onSubmit={handleSubmit}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default LoginPage;
