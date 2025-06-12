"use client";
import {
  user_form_data_t,
  user_union_t,
  UserRoleEnum,
  response_schema,
  OkPacket,
} from "@/types";
import ClientTable from "@/features/dashboard/clientes/components/ClientTable";
import NavigationBar from "@/features/common/components/NavigationBar";
import UserModal from "@/features/common/components/UserModal";
import UserSearchBar from "@/features/common/components/UserSearchBar";
import { useClientList } from "@/features/dashboard/clientes/hooks/useClientList";
import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import { useState } from "react";
import { Container } from "react-bootstrap";
import { createUser, editUser } from "@/services/user"
import { useRouter } from "next/router";
import { AppError } from "@/utils/errors";
import ConfirmDeleteModal from "@/features/common/components/ConfirmDeleteModal";

export default function ClientesDashboard() {
  const router = useRouter();
  const { users, searchClients, refresh } = useClientList();
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


  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState<user_form_data_t>(initialValues);
  const [selectedId, setSelectedUser] = useState(-1)
  const [deleteTarget, setDeleteTarget] = useState<user_union_t | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const createUserSubmit = async (values: user_form_data_t) => {
    console.log("createUserSubmit", values);
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      router.push("/login");
      return;
    }
    try {
      const result = await createUser(values, token);
      addSuccess("Usuario creado correctamente");
      refresh();
    } catch (e) {
      if (e instanceof AppError) {
        if (e.code === "INVALID_TOKEN")
          addError(
            `Error al crear el usuario: ${
              e.message
            }`
          );
      }
      console.log("Error al crear usuario:", e);
      if (e instanceof AppError && (e.code === "TOKEN_EXPIRED" || e.code === "UNAUTHORIZED" || e.code === "SESSION_EXPIRED" || e.code === "MISSING_TOKEN"))
        router.push("/login")
      addError(
        `Error al crear el usuario: ${
          (e instanceof Error) ? e.message : "Error desconocido"
        }`
      )
    }

  };

  const onUserEdit = (user: user_union_t) => {
    setSelectedUser(user.id);
    console.log("Editando usuario con ID:", user.id);
    console.log(user);

    if (user.type === "safe") {
      console.log("sin permiso")
      addError('No tienes los permisos para hacer eso.');
      return
    }
    setFormValues(user)
    setShowModal(true);
  }

  const onUserAdd = () => {
    setShowModal(true);
  }

  const editSubmit = async (values: user_form_data_t, id: number) => {
    console.log("editSubmit", values, id);
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
    try {
      const response = await editUser(id, values, token);;
      addSuccess("Usuario editado correctamente");
      setShowModal(false);
      setFormValues(initialValues);
      await refresh();
    } catch (e) {
       console.error("Error al editar al usuario:", e);
       if (e instanceof AppError && (e.code === "TOKEN_EXPIRED" || e.code === "UNAUTHORIZED" || e.code === "SESSION_EXPIRED" || e.code === "MISSING_TOKEN"))
           router.push("/login")
      addError(
        `Error al editar el usuario: ${e instanceof Error ? e.message : "Error desconocido"
        }`
      );
    }
  }

  const onSubmit = async (values: user_form_data_t, id?: number) => {
    const editing = id !== undefined && id !== -1;
    if (editing) 
      editSubmit(values, id)
    else 
      createUserSubmit(values);
    console.log("onSubmit", values, id);
  }

  const onUserDelete = (user: user_union_t) => {
  if (user.type === "safe") {
    addError('No tienes los permisos para hacer eso.');
    return;
  }
  setDeleteTarget(user);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  if (!deleteTarget) return;
  setShowDeleteModal(false);
  setDeleteTarget(null);

  const token = localStorage.getItem("token");
  if (!token) {
    addError("No estás autenticado. Por favor, inicia sesión.");
    return;
  }

  try {
    const res = await fetch(`/api/users/${deleteTarget.id}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      addError(`Error al eliminar el usuario: ${errorText}`);
      return;
    }

    const json = await res.json();
    const response = response_schema(OkPacket).parse(json);
    if (json.status !== "success") {
      if (json.code === "SESSION_EXPIRED") {
        addError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        router.push("/login");
        return;
      }

      addError(`Error al eliminar el usuario: ${json.message}`);
      return;
    }

    addSuccess("Usuario eliminado correctamente.");
    await refresh();
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    addError(`Error desconocido al eliminar: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
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
          {users ? <ClientTable onView = {()=> {}} users={users} onEdit={onUserEdit} onAdd={onUserAdd} onDelete={onUserDelete} /> : null}
          </>
        )}
      </Container>
      <UserModal
        show={showModal} 
        editing={selectedId !== -1}
        onClose= {()=>{setSelectedUser(-1); setFormValues(initialValues); setShowModal(false);}}
        onSubmit= {onSubmit}
        initialFormValues = {formValues}
        userId = {selectedId}
      ></UserModal>

    <ConfirmDeleteModal
      show={showDeleteModal}
      onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
      onConfirm={confirmDelete}
      itemName={deleteTarget?.nombre ? deleteTarget?.nombre + deleteTarget?.apellidos : ""}
    />
    </>
  );
}
