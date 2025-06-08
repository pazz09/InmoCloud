import Head from "next/head";
import { Container } from "react-bootstrap";

import LoginForm from "@/features/login/components/LoginForm";
import { useLogin } from "@/features/login/hooks/useLogin";

import TimedAlerts from "@/features/common/components/TimedAlerts";

const LoginPage = () => {
  const {
    rut,
    password,
    submitting,
    redirecting,
    onRutChange,
    onPasswordChange,
    handleSubmit,
    formErrors,
    visibleAlerts,
  } = useLogin();

  return (
    <>
    <Head><title>Iniciar Sesión</title></Head>
    <Container 
        fluid
        className = "d-flex align-items-center justify-content-center"
        style={{ minHeight: "90vh", backgroundColor: "#f5f6f7" }}
    >

      <LoginForm 
          rut={rut}
          password={password}
          submitting={submitting}
          redirecting={redirecting}
          onRutChange={onRutChange}
          onPasswordChange={onPasswordChange}
          onSubmit={handleSubmit}
          formErrors={formErrors}
      />
      <TimedAlerts alerts={visibleAlerts} onDismiss={()=>{}}/>
    </Container>
    </>
  );
};


export default LoginPage;
