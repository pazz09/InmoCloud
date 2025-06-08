"use client";
import {
  user_form_data_t,
  UserRoleEnum,
} from "@/backend/types";
import ClientTable from "@/components/ClientTable";
import NavigationBar from "@/components/Navbar";
import UserModal from "@/components/UserModal";
import UserSearchBar from "@/components/UserSearchBar";
import { useClientList } from "@/hooks/useClientList";
import { useTimedAlerts } from "@/hooks/useTimedAlerts";
import { useState } from "react";
import { Container } from "react-bootstrap";
import { createUser } from "@/services/user"

export default function ClientesDashboard() {
  const { users, searchClients } = useClientList();
// TODO: Revisar (por qué tan pocas cosas?)
  const { addError, addSuccess } =
    useTimedAlerts();


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


  const [showAddModal, setShowAddModal] = useState(false);

  const createUserSubmit = async (values: user_form_data_t) => {
    console.log("createUserSubmit", values);
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
    try {
      await createUser(initialValues, token);
      addSuccess("Usuario creado correctamente");
    } catch (e) {
      console.log("Error al crear usuario:", e);
      addError(
        `Error al crear el usuario: ${(e instanceof Error) ? e.message : "Error desconocido"
        }`
      )
    }

  };

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
