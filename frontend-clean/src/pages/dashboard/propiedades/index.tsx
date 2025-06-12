import NavigationBar from "@/features/common/components/NavigationBar";
import { Container, Modal, Button } from "react-bootstrap";
import { TablaPropiedades } from "@/features/dashboard/propiedades/components/TablaPropiedades";
import { usePropiedadesPage } from "@/features/dashboard/propiedades/hooks/usePropiedadesPage";
import PropertyModal from "@/features/dashboard/propiedades/components/PropertyModal";
import { useState } from "react";
import { property_view_t, property_form_add_t, property_form_edit_t } from "@/types";
import { createProperty, deleteProperty } from "@/services/properties";
import { useTimedAlerts } from "@/features/common/hooks/useTimedAlerts";
import { createUser } from "@/services/user";

export default function PropiedadesPage() {
  const { propiedades, refresh } = usePropiedadesPage();
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "delete" | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<property_view_t | null>(null);
  const { visibleAlerts, addError, addSuccess, dismissAlert } = useTimedAlerts();

  const handleAction = (mode: "view" | "edit" | "delete", property: property_view_t) => {
    setSelectedProperty(property);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedProperty(null);
    setModalMode(null);
    setShowModal(true);
  };

  const handleModalSubmit = (values: property_form_add_t | property_form_edit_t) => {
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
        const result = createProperty(values, token);
        addSuccess("Propiedad creada correctamente");
        refresh();
      } catch (e) {
        console.log("Error al crear propiedad:", e);
        addError(
          `Error al crear la propiedad: ${
          (e instanceof Error) ? e.message : "Error desconocido"
          }`
        )
      }

      console.log("Adding new property:", values);
    } else if (modalMode === "edit") {
      // Lógica para editar propiedad existente
      console.log("Editing property:", selectedProperty?.id, values);
    }
    
    setShowModal(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  function handleConfirm(): void {
    const token = localStorage.getItem("token");
    if (!token) {
      addError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    // Lógica de confirmación aquí
    try {
      const result = deleteProperty(selectedProperty!.id, token);
      addSuccess("Propiedad eliminada con éxito");
      refresh();
    } catch (e) {
      console.log("Error al eliminar propiedad:", e);
      addError(
        `Error al eliminar propiedad: ${
        (e instanceof Error) ? e.message : "Error desconocido"
        }`
      )
    }

    console.log("Deleting property:", selectedProperty?.id);
    setShowModal(false);
  }

  return (
    <>
      <NavigationBar />
      <Container className="mt-5">
        <h2 className="mb-4">Tabla Propiedades</h2>
        <TablaPropiedades 
          propiedades={propiedades}
          onAdd={handleAdd}
          onView={(p) => handleAction("view", p)}
          onEdit={(p) => handleAction("edit", p)}
          onDelete={(p) => handleAction("delete", p)}
        />
      </Container>
      
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
    </>
  );
}