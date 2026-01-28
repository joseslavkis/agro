import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { LoginRequestSchema } from "@/models/Login";
import { useLogin } from "@/services/UserServices";

import styles from "./Auth.module.css";

export const LoginScreen = () => {
  const { mutate, error } = useLogin();

  const formData = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => mutate(value),
  });

  return (
    <CommonLayout>
      <div className={styles.authContainer}>
        <h1 className={styles.title}>Iniciar Sesión</h1>
        <formData.AppForm>
          <formData.FormContainer extraError={error}>
            <formData.AppField name="email" children={(field) => <field.TextField label="Correo Electrónico" />} />
            <formData.AppField name="password" children={(field) => <field.PasswordField label="Contraseña" />} />
          </formData.FormContainer>
        </formData.AppForm>
      </div>
    </CommonLayout>
  );
};
