import { useId } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useFieldContext } from "@/config/form-context";

import styles from "./InputFields.module.css";

export const TextField = ({ label }: { label: string }) => {
  return <FieldWithType type="text" label={label} />;
};

export const PasswordField = ({ label }: { label: string }) => {
  return <FieldWithType type="password" label={label} />;
};

const FieldWithType = ({ label, type }: { label: string; type: string }) => {
  const id = useId();
  const field = useFieldContext<string>();
  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.dataContainer}>
        <input
          id={id}
          name={field.name}
          value={field.state.value}
          className={styles.input}
          type={type}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
        {field.state.meta.isTouched && <ErrorContainer errors={field.state.meta.errors} />}
      </div>
    </div>
  );
};

export const DateField = ({ label }: { label: string }) => {
  return <FieldWithType type="date" label={label} />;
};

export const SelectField = ({ label, options }: { label: string, options: { value: string, label: string }[] }) => {
  const id = useId();
  const field = useFieldContext<string>();
  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.dataContainer}>
        <select
          id={id}
          name={field.name}
          value={field.state.value}
          className={styles.input}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {field.state.meta.isTouched && <ErrorContainer errors={field.state.meta.errors} />}
      </div>
    </div>
  );
};
