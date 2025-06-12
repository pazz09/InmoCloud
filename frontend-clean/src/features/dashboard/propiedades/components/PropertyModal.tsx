import { property_form_add_t } from "@/types";
import { useState } from "react";

interface PropertyModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: property_form_add_t, id?: number) => void;
  editing: boolean;
  initialFormValues?: property_form_add_t;
  propertyId?: number;
}


// const property_form_add_partial_schema = property_search_schema.partial();
// type property_form_add_partial_t = z.infer<typeof property_search_schema>;


export default function PropertyModal({show, onClose, onSubmit, editing, initialFormValues, propertyId}: PropertyModalProps) {
  const [formValues, setFormValues] = useState<property_form_add_t>({
    rol: "",
    direccion: "",
    activa: false,
    valor: 0,
    propietario_id: -1,
  });

  const [formErrors, setFormErrors] =  useState<Partial<Record<keyof , string>>>({});
}

