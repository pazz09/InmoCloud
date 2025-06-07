"use client";
import {
  response_schema,
  OkPacket,
  update_response_schema,
  user_form_data_t,
  UserRoleEnum,
} from "@/backend/types";
import ClientTable from "@/components/ClientTable";
import NavigationBar from "@/components/Navbar";
import UserModal from "@/components/UserModal";
import UserSearchBar from "@/components/UserSearchBar";
import { useAuth } from "@/context/AuthContext";
import { useClientList } from "@/hooks/useClientList";
import { useTimedAlerts } from "@/hooks/useErrorQueue";
import { create } from "domain";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { createUser } from "@/services/user"

export default function ClientesDashboard() {
  const { users, searchClients } = useClientList();
  const { visibleAlerts, addError, addSuccess, dismissAlert } =
    useTimedAlerts();
  const router = useRouter();
  const { logout } = useAuth();

  const initialValues: user_form_data_t = {
    nombre: "",
    apellidos: "",
    mail: "",
    telefono: "",
    role: UserRoleEnum.SIN_SESION,
    rut: "",
    passwordHash: "",
    type: "full",
  };

  const [formValues, setFormValues] = useState<user_form_data_t>(initialValues);

  const [showAddModal, setShowAddModal] = useState(false);

  const createUserSubmit = async (values: user_form_data_t) => {
    console.log("createUserSubmit", values);
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
    try {
      await createUser(formValues, token);
      addSuccess("Usuario creado correctamente");
    } catch (e) {
      console.log("Error al crear usuario:", e);
      addError(
        `Error al crear el usuario: ${
        (e instanceof Error) ? e.message : "Error desconocido"
        }`
      )
    }

  const handleSearch = (params: {
    name?: string;
    role?: UserRoleEnum;
    property_name?: string;
  }) => {
    searchClients(params);
  };

  return (
    <>
      <NavigationBar />
      <Container className="mt-5">
        <h2 className="mb-4">Lista de Clientes</h2>
        <UserSearchBar onSearch={handleSearch} />
        {users && (
          <>
            <ClientTable
              users={users}
              onEdit={() => { }}
              onAdd={() => setShowAddModal(true)}
              onDelete={() => { }}
            ></ClientTable>
          </>
        )}
      </Container>
      <UserModal
        show={showAddModal}
        onSubmit={async (formValues) => {
          await createUserSubmit(formValues);
        }}
        onClose={() => {
          setShowAddModal(false);
        }}
        userId={0}
        editing={false}
      ></UserModal>
    </>
  );
}
