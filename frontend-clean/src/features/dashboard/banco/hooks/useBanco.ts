import { fetchPayments } from "@/services/payments";
import { payment_search_params_t, payment_view_t } from "@/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type BancoProvides = {
  pagos: payment_view_t[];
  onView: (payment: payment_view_t) => void;
  onEdit: (payment: payment_view_t) => void;
  onDelete: (payment: payment_view_t) => void;
};

export function useBanco(): BancoProvides {
  const router = useRouter();

  const [pagos, setPagos] = useState<payment_view_t[]>([]);
  const [searchParams] = useState<payment_search_params_t>({});

  useEffect(() => {
    const method = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");
      const result = await fetchPayments(token, searchParams);
      setPagos(result);
    };
    method();
  }, []);

  const onView = (payment: payment_view_t) => {
    router.push(`/dashboard/pagos/${payment.id}`);
  };

  const onEdit = (payment: payment_view_t) => {
    router.push(`/dashboard/pagos/${payment.id}/edit`);
  };

  const onDelete = (payment: payment_view_t) => {
    const confirmed = confirm("¿Estás seguro que deseas eliminar este pago?");
    if (confirmed) {
      console.log("Eliminar pago:", payment);
      // Aquí podrías llamar a un servicio de eliminación en el backend.
    }
  };

  return {
    pagos,
    onView,
    onEdit,
    onDelete,
  };
}
