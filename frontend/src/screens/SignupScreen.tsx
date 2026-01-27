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
      onChange: SignupRequestSchema,
    },
    onSubmit: async ({ value }) => mutate(value),
  });

  return (
    <CommonLayout>
      <h1>Sign Up</h1>
      <formData.AppForm>
        <formData.FormContainer extraError={error}>
          <formData.AppField name="name" children={(field) => <field.TextField label="Name" />} />
          <formData.AppField name="lastname" children={(field) => <field.TextField label="Last Name" />} />
          <formData.AppField name="email" children={(field) => <field.TextField label="Email" />} />
          <formData.AppField name="password" children={(field) => <field.PasswordField label="Password" />} />
          <formData.AppField name="birthDate" children={(field) => <field.DateField label="Date of Birth" />} />
          <formData.AppField name="gender" children={(field) => <field.SelectField label="Gender" options={[
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' }
          ]} />} />
        </formData.FormContainer>
      </formData.AppForm>
    </CommonLayout>
  );
};
