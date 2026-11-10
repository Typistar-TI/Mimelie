import { useState, type FormEvent } from "react";
import {
  AdminLoginLayout,
  Field,
  Input,
  useToast,
} from "@mimelie/design-system";
import { useLogin, useLogout } from "./hooks";

export function LoginScreen() {
  const [error, setError] = useState("");
  const { showToast } = useToast();
  const login = useLogin();
  const logout = useLogout();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const result = await login.mutateAsync({
        email: String(form.get("email")),
        password: String(form.get("password")),
        totpCode: String(form.get("totpCode") || "") || undefined,
      });
      if (result.user.role !== "ADMIN" && result.user.role !== "EDITOR") {
        await logout.mutateAsync();
        throw new Error("Esta conta não tem acesso ao painel.");
      }
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Não foi possível entrar.";
      setError(message);
      showToast({
        title: "Não foi possível entrar",
        description: message,
        tone: "error",
      });
    }
  };
  return (
    <AdminLoginLayout error={error} onSubmit={submit} pending={login.isPending}>
            <Field label="E-mail">
              <Input
                name="email"
                required
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
              />
            </Field>
            <Field label="Senha">
              <Input
                name="password"
                required
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha"
              />
            </Field>
            <Field
              label="Código TOTP"
              hint="Preencha somente quando a autenticação em duas etapas estiver ativa."
            >
              <Input
                name="totpCode"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
              />
            </Field>
    </AdminLoginLayout>
  );
}
