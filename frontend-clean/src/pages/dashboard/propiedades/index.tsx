import NavigationBar from "@/features/common/components/NavigationBar";
import { Container, Modal, Button } from "react-bootstrap";
import { TablaPropiedades } from "@/features/dashboard/propiedades/components/TablaPropiedades";
import PropertyModal from "@/features/dashboard/propiedades/components/PropertyModal";
import { useState } from "react";
import { property_view_t, property_form_add_t, property_form_edit_t, property_form_arrendatario_t, property_search_t } from "@/types";
import { asignarArrendatario, createProperty, deleteProperty, editProperty, PropertySearchFilters } from "@/services/properties";
import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import { createUser } from "@/services/user";
import ArrendatarioModal from "@/features/dashboard/propiedades/components/ArrendatarioModal";
import TimedAlerts from "@/features/common/components/TimedAlerts";
import PropertySearchBar from "@/features/dashboard/propiedades/components/PropertySearchBar";
import { usePropertyList } from "@/features/dashboard/propiedades/hooks/usePropertyList";

export default function PropiedadesPage() {
  const { propiedades, searchProperties, refresh } = usePropertyList();
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "delete" | "arrendatario" | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<property_view_t | null>(null);
  const { visibleAlerts, addError, addSuccess, dismissAlert } = useTimedAlerts();

  const handleAction = (mode: "view" | "edit" | "delete" | "arrendatario", property: property_view_t) => {
    setSelectedProperty(property);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedProperty(null);
    setModalMode(null);
    setShowModal(true);
  };

  const handleModalSubmit = async (values: property_form_add_t | property_form_edit_t) => {
    // Aquí implementarías la lógica para guardar/actualizar/eliminar la propiedad
    console.log("Submitted values:", values);
    console.log("Mode:", modalMode);
    
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
    
    if (modalMode === null) {
      // Lógica para agregar nueva propiedad
      try {
        await createProperty(values, token);
        addSuccess("Propiedad creada correctamente");
        refresh();
        setShowModal(false);
      } catch (e) {
        console.log("Error al crear propiedad:", e);
        addError(
          `Error al crear la propiedad: ${
          (e instanceof Error) ? e.message : "Error desconocido"
          }`
        )
      } finally {
        console.log("Adding new property:", values);
      }

    } else if (modalMode === "edit") {
      // Lógica para editar propiedad existente
      try {
        await editProperty(selectedProperty!.id, {id: selectedProperty!.id, ...values}, token);
        addSuccess("Propiedad actualizada correctamente");
        refresh();
        setShowModal(false);
      } catch (e) {
        console.log("Error al actualizar propiedad:", e);
        addError(
          `Error al actualizar la propiedad: ${
          (e instanceof Error) ? e.message : "Error desconocido"
          }`
        )
      } finally {
        console.log("Editing property:", selectedProperty?.id, values);
      }

    }
    
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  const handleAssign = async (values: property_form_arrendatario_t) => {
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    // Lógica de asignación aquí
    try {
      await asignarArrendatario(selectedProperty!.id, values, token);
      addSuccess("Arrendatario asignado con éxito");
      refresh();
      setShowModal(false);
    } catch (e) {
      console.log("Error al actualizar arrendatario:", e);
      addError(
        `Error al actualizar el arrendatario: ${
        (e instanceof Error) ? e.message : "Error desconocido"
        }`
      )
    } finally {
      console.log("Editando arrendatario:", selectedProperty?.id, values);
    }
  }

  async function handleConfirm(): Promise<void> {
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    // Lógica de confirmación aquí
    try {
      await deleteProperty(selectedProperty!.id, token);
      addSuccess("Propiedad eliminada con éxito");
      refresh();
    } catch (e) {
      console.log("Error al eliminar propiedad:", e);
      addError(
        `Error al eliminar propiedad: ${
        (e instanceof Error) ? e.message : "Error desconocido"
        }`
      )
    } finally {
      console.log("Deleting property:", selectedProperty?.id);
      setShowModal(false);
    }
  }

  const handleSearch = (params: property_search_t) => {
    searchProperties(params);
  };

  return (
    <>
      <NavigationBar />
      <TimedAlerts alerts={visibleAlerts} onDismiss={dismissAlert}/>
      
      <Container className="mt-5">
        <h2 className="mb-4">Tabla Propiedades</h2>
        <PropertySearchBar onSearch={handleSearch} />
        <TablaPropiedades 
          propiedades={propiedades ? propiedades : []}
          onView={(p) => handleAction("view", p)}
          onEdit={(p) => handleAction("edit", p)}
          onDelete={(p) => handleAction("delete", p)}
          onArrendatario={(p) => handleAction("arrendatario", p)}
        />
        <div className="mb-3 text-end">
          <Button variant="success" onClick={handleAdd}>
            Agregar Propiedad
          </Button>
        </div>
      </Container>
      
      {(modalMode === undefined || modalMode === null || modalMode === "edit") && (
        <PropertyModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editing={modalMode === "edit"}
          mode={modalMode}
          initialFormValues={selectedProperty ? {
            id: selectedProperty.id,
            rol: selectedProperty.rol,
            direccion: selectedProperty.direccion,
            activa: selectedProperty.activa,
            valor: selectedProperty.valor,
            propietario_id: selectedProperty.propietario_id
          } : undefined}
        />
      )}

      {modalMode === "delete" && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Eliminar Propiedad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de eliminar esta propiedad? Esta acción no se puede deshacer.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {modalMode === "arrendatario" && (
        <ArrendatarioModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleAssign}
          mode={modalMode}
          initialFormValues={selectedProperty ? {
            arrendatario_id: selectedProperty.arrendatario_id,
            fecha_arriendo: selectedProperty.fecha_arriendo
            
          } : undefined}
        />
      )}
    </>
  );
}