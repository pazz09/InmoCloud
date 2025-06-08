import { fetchPayments } from "@/services/payments";
import { payment_search_params_t, payment_view_t } from "@/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type BancoProvides = {
  pagos: payment_view_t[]
}

export function useBanco(): BancoProvides {
  const router = useRouter();

  const [pagos, setPagos] = useState<payment_view_t[]>([]);
  const [searchParams, setSearchParams] = useState<payment_search_params_t>({});
  useEffect(()=> {
    const method = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");
      setPagos(await fetchPayments(token, searchParams));
    }
    method();
  }, [])
  return {
    pagos
  }
}
