"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { UserRoleEnum } from "@/types";

export default function HomeRedirect() {
  const router = useRouter();
  const { role, isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated)
      switch (role) {
        case UserRoleEnum.ARRENDATARIO:
        case UserRoleEnum.PROPIETARIO:
          router.push("/clientes");
          return;
        case UserRoleEnum.ADMINISTRADOR:
        case UserRoleEnum.CORREDOR:
          router.push("/dashboard/principal");
          return;
        default:
          router.push("/login");
          return;
      }
    else {
      router.push("/login");
    }
  }, [router, role, isAuthenticated]);
  return null; // No se muestra nada, solo redirige
}
