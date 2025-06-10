import { Mode, user_form_data, user_form_data_t } from "@/types";
import { useState } from "react";

export function useUserForm({
  mode,
  initialValues,
  onSave,
}: {
  mode: Mode;
  initialValues: user_form_data_t;
  onSave: (data: user_form_data_t) => Promise<void>;
}) {
  const [formValues, setFormValues] = useState<user_form_data_t>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev: user_form_data_t) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const parsed = user_form_data.safeParse(formValues);
    if (!parsed.success) {
      const errors: { [key: string]: string } = {};
      for (const [key, messages] of Object.entries(parsed.error.formErrors.fieldErrors)) {
        if (messages && messages.length > 0) errors[key] = messages[0];
      }
      setFieldErrors(errors);
      return null;
    }
    return parsed.data;
  };

  const handleSave = async () => {
    const validated = validate();
    if (!validated) return;
    await onSave(validated);
  };

  const resetForm = () => {
    setFormValues(initialValues);
    setFieldErrors({});
    setGeneratedPassword(null);
  };

  return {
    formValues,
    fieldErrors,
    generatedPassword,
    setFormValues,
    setGeneratedPassword,
    handleInputChange,
    handleSave,
    resetForm,
  };
}
