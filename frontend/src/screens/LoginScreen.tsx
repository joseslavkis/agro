import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { LoginRequestSchema } from "@/models/Login";
import { useLogin } from "@/services/UserServices";

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
      <h1 style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '1.5rem', textAlign: 'center' }}>Iniciar Sesión</h1>
      <formData.AppForm>
        <formData.FormContainer extraError={error}>
          <formData.AppField name="email" children={(field) => <field.TextField label="Correo Electrónico" />} />
          <formData.AppField name="password" children={(field) => <field.PasswordField label="Contraseña" />} />
        </formData.FormContainer>
      </formData.AppForm>
    </CommonLayout>
  );
};
