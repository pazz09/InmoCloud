import { useAuth } from "@/context/AuthContext";
import NavigationBar from "@/features/common/components/NavigationBar";
import { fetchPayments } from "@/services/payments";
import { fetchUsers } from "@/services/user";
import { payment_view_t } from "@/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export default function () {

  const router = useRouter();
  const payment_id = router.query.id;
  const [paymentData, setPaymentData] = useState<payment_view_t| null>(null);

  const auth = useAuth();
  useEffect(()=> {
    const fn = async () => {
      const parsed_payment_id = Number.parseInt(payment_id as string);
      if (!parsed_payment_id) return;
      console.log("Loading payment with id", parsed_payment_id);
      const token = localStorage.getItem("token");
      if (!token) router.push("/login");
      console.log("Fetching payments")
      const payment_data = await fetchPayments(token!, {id: parsed_payment_id});
      const payment = payment_data[0];
      setPaymentData(payment);
      console.log(payment_data);
    };
    fn();
  }, [router, payment_id])
  return (<>
    <NavigationBar />

    <Container className="mt-5">
    <div style={{
      display: "flex",
      // flexDirection: "row",
      alignItems: "center",
      gap: "20px"
    }}>

      <FaArrowLeft style= {{
        backgroundColor:"#eee",
        borderRadius: "10px",
        padding:      "5px",
        width:        "30px",
        height:       "auto",
        cursor:       "pointer"
      }} onClick = {() => {router.back()}} /> 
      <h2 >
        { paymentData ? "Pago N" + (paymentData?.id)?.toString(): "Cargando..."}
      </h2>
    </div>
    </Container>
  </>);
}
