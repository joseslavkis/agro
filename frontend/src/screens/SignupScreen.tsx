import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { SignupRequestSchema } from "@/models/Signup";
import { useSignup } from "@/services/UserServices";

export const SignupScreen = () => {
  const { mutate, error } = useSignup();

  const formData = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      lastname: "",
      birthDate: "",
      gender: "Other",
    },
    validators: {
      onChange: SignupRequestSchema as any,
    },
    onSubmit: async ({ value }) => mutate(value as unknown as any),
  });

  return (
    <CommonLayout>
      <h1 style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '1.5rem', textAlign: 'center' }}>Registrarse</h1>
      <formData.AppForm>
        <formData.FormContainer extraError={error}>
          <formData.AppField name="name" children={(field) => <field.TextField label="Nombre" />} />
          <formData.AppField name="lastname" children={(field) => <field.TextField label="Apellido" />} />
          <formData.AppField name="email" children={(field) => <field.TextField label="Correo Electrónico" />} />
          <formData.AppField name="password" children={(field) => <field.PasswordField label="Contraseña" />} />
          <formData.AppField name="birthDate" children={(field) => <field.DateField label="Fecha de Nacimiento" />} />
          <formData.AppField name="gender" children={(field) => <field.SelectField label="Género" options={[
            { value: 'Male', label: 'Masculino' },
            { value: 'Female', label: 'Femenino' },
            { value: 'Other', label: 'Otro' }
          ]} />} />
        </formData.FormContainer>
      </formData.AppForm>
    </CommonLayout>
  );
};
