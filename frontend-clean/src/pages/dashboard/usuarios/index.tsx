'use client';

import { OkPacket, response_schema, update_response_schema, user_form_data_t, user_union_t, UserRoleEnum } from "@/types";

import { useAuth } from "@/context/AuthContext";

import ErrorAlerts from "@/features/common/components/TimedAlerts";
import NavigationBar from "@/features/common/components/NavigationBar";
import UserModal from "@/features/common/components/UserModal";
import UserTable from "@/features/common/components/UserTable";
import ConfirmDeleteModal from "@/features/common/components/ConfirmDeleteModal";

import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import { useUserList } from "@/features/dashboard/usuarios/hooks/useUserList";

// import { Head } from "next/document";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { createUser, editUser } from "@/services/user";
import  { AppError } from "@/utils/errors"

const initialValues = {name: "", role: "", rut: "", passwordHash: ""}

export default function UsersDashboard() {
  const [showModal, setShowModal] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { users, loading, error, searchUsers } = useUserList();
  const { visibleAlerts, addError, addSuccess, dismissAlert } = useTimedAlerts();
  const [selectedId, setSelectedUser] = useState(-1)

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<user_union_t | null>(null);

  const initialValues: user_form_data_t = {
    nombre: "",
    apellidos: "",
    mail: "",
    telefono: "",
    role: UserRoleEnum.SIN_SESION,
    rut: "",
    passwordHash: "",
    type: "full"
  };
  const [formValues, setFormValues] = useState<user_form_data_t>(initialValues);


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

  const createUserSubmit = async (values: user_form_data_t) => {
    console.log("createUserSubmit", values);
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
    try {
      const result = await createUser(formValues, token);
      addSuccess("Usuario creado correctamente");
    } catch (e) {
      console.log("Error al crear usuario:", e);
      addError(
        `Error al crear el usuario: ${
        (e instanceof Error) ? e.message : "Error desconocido"
        }`
      )
    }

  };

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
      await searchUsers(token, {});
    } catch (e) {
       console.error("Error al editar al usuario:", error);
       if (e instanceof AppError && (e.code === "TOKEN_EXPIRED" || e.code === "UNAUTHORIZED" || e.code === "SESSION_EXPIRED"))
           router.push("/login")
      addError(
        `Error al editar el usuario: ${e instanceof Error ? e.message : "Error desconocido"
        }`
      );
    }
  }
  //     if (parsed.status !== "success") {
  //       addError(`Error al editar el usuario: ${parsed.message}`);
  //       return;
  //     }
  //     if (parsed.data.affectedRows === 0) {
  //       addError("No se modificó ningún usuario. Verifica que los datos sean correctos.");
  //       return;
  //     } else {
  //       addSuccess("Usuario editado correctamente.");
  //       setShowModal(false);
  //       setSelectedUser(-1);
  //       setFormValues(initialValues);
  //       // Refresh the user list
  //       await searchUsers();
  //     }
  //   } catch (error) {
  //     console.error("Error al editar el usuario:", error);
  //     addError(`Error al editar el usuario: ${error instanceof Error ? error.message : "Error desconocido"}`);
  //   }
  // }

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
    await searchUsers(token, {});
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    addError(`Error desconocido al eliminar: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
};


  // const [editMode, setEditMode] = useState<Mode>()
  // const initialValues = {rut: "", nombre: "", passwordHash: "", role: ""}
  // const userForm = useUserForm({editMode, initialValues, onSave: async () => {console.log(editMode, "onSave")}});
  //


  // useEffect(() => {
  //   if (!auth.isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [auth.isAuthenticated, router]);


  return (
    <>
    <NavigationBar />
    <Container className="mt-5">
    <h2 className="mb-4 text-left">Lista de Usuarios</h2>
    {users ? <UserTable users={users} onEdit={onUserEdit} onAdd={onUserAdd} onDelete={onUserDelete} /> : null}
    </Container>
    <ErrorAlerts alerts={visibleAlerts} onDismiss={dismissAlert}/>
    <UserModal
      show={showModal} 
      editing={selectedId !== -1}
      onClose= {()=>{setSelectedUser(-1); setFormValues(initialValues); setShowModal(false);}}
      onSubmit= {onSubmit}
      initialFormValues = {formValues}
      userId = {selectedId}

    />
    <ConfirmDeleteModal
      show={showDeleteModal}
      onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
      onConfirm={confirmDelete}
      itemName={deleteTarget?.nombre! + deleteTarget?.apellidos}
    />

    </>
  );
}
