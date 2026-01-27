import { useState } from "react";
import { useLocation } from "wouter";
import { useVerify } from "@/services/UserServices";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import styles from "@/components/form-components/FormContainer/FormContainer.module.css";
import inputStyles from "@/components/form-components/InputFields/InputFields.module.css";
import btnStyles from "@/components/form-components/SubmitButton/SubmitButton.module.css";

export const VerifyScreen = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [, setLocation] = useLocation();

    const { mutate, error, isPending } = useVerify();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate({ email, code }, {
            onSuccess: () => {
                alert("Account verified! You can now log in.");
                setLocation("/login");
            }
        });
    };

    return (
        <CommonLayout>
            <h1>Verify Account</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={inputStyles.fieldWrapper}>
                    <label className={inputStyles.label}>Email</label>
                    <input
                        className={inputStyles.input}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className={inputStyles.fieldWrapper}>
                    <label className={inputStyles.label}>Verification Code</label>
                    <input
                        className={inputStyles.input}
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder="6-digit code"
                        required
                    />
                </div>

                {error && <div style={{ color: 'red', marginTop: '10px' }}>{error.message}</div>}

                <button type="submit" className={btnStyles.button} style={{ height: '48px', marginTop: '1rem' }} disabled={isPending}>
                    {isPending ? "Verifying..." : "Verify"}
                </button>
            </form>
        </CommonLayout>
    );
};
