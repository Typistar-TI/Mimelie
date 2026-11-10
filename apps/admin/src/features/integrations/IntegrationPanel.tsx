import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Field,
  LoadingCard,
  PanelHeader,
  Select,
  Textarea,
} from "@mimelie/design-system";
import {
  useIntegrations,
  useUpdateIntegration,
  useValidateWhatsApp,
} from "./hooks";
export function IntegrationPanel() {
  const providers = [
    "smtp",
    "telegram",
    "whatsapp",
    "instagram",
    "facebook",
    "x",
  ];
  const integrations = useIntegrations();
  const update = useUpdateIntegration();
  const validate = useValidateWhatsApp();
  const [provider, setProvider] = useState(providers[0] ?? "telegram");
  const [notice, setNotice] = useState("");
  const isSmtp = provider === "smtp";
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const credentials = String(form.get("credentials")).trim();
      const settings = String(form.get("settings")).trim();
      await update.mutateAsync({
        provider,
        input: {
          enabled: form.get("enabled") === "on",
          settings: settings ? JSON.parse(settings) : {},
          credentials: credentials ? JSON.parse(credentials) : undefined,
        },
      });
      setNotice(
        `${provider} foi salvo. Segredos são cifrados antes de entrar no banco.`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Revise o JSON de configurações e credenciais.",
      );
    }
  };
  const validateWhatsApp = async () => {
    try {
      const response = await validate.mutateAsync();
      setNotice(
        response.ok
          ? "Todos os destinos foram validados. Agora você pode ativar o WhatsApp."
          : "Alguns destinos não foram validados. Revise o número dedicado e as permissões.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível validar os destinos.",
      );
    }
  };
  const items = integrations.data?.data ?? [];
  if (integrations.isLoading)
    return (
      <Card className="p-5 sm:p-6">
        <PanelHeader eyebrow="Conexões" title="Integrações e destinos" />
        <div className="mt-5 grid gap-3">
          <LoadingCard />
          <LoadingCard />
        </div>
      </Card>
    );
  return (
    <Card className="p-5 sm:p-6">
      <PanelHeader
        eyebrow="Conexões"
        title="Integrações e destinos"
        description="Ative apenas após validar a conta e o destino. Cada falha pausa somente esta integração."
      />
      <div className="mt-5 flex flex-wrap gap-2">
        {providers.map((item) => (
          <span
            key={item}
            className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${
              items.find((integration) => integration.provider === item)
                ?.enabled
                ? "bg-pine-soft text-pine"
                : "bg-ink/6 text-ink/50"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
      <form className="mt-6 grid max-w-2xl gap-4" onSubmit={save}>
        <Field label="Provedor">
          <Select
            name="provider"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
          >
            {providers.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
        <Checkbox name="enabled" label="Ativar após salvar" />
        <Field label="Configurações JSON">
          <Textarea
            className="font-mono text-xs"
            name="settings"
            placeholder={
              isSmtp
                ? '{"host":"smtp.exemplo.com","port":587,"from":"nao-responda@exemplo.com"}'
                : '{"feedUrl":"https://..."}'
            }
          />
        </Field>
        <Field label="Credenciais JSON">
          <Textarea
            className="font-mono text-xs"
            name="credentials"
            placeholder={
              isSmtp
                ? '{"user":"...","password":"..."}'
                : provider === "whatsapp"
                  ? '{"bridgeUrl":"http://whatsapp:3100","bridgeToken":"...","destinations":"120...@g.us"}'
                  : '{"botToken":"...","chatId":"..."}'
            }
          />
        </Field>
        {isSmtp && (
          <p className="rounded-xl bg-ink/[0.035] px-3 py-2 text-xs leading-5 text-ink/60">
            Host, porta e remetente ficam em configurações; usuário e senha são
            cifrados antes de serem gravados. O SMTP só pode ser ativado com os
            três primeiros campos preenchidos.
          </p>
        )}
        {provider === "whatsapp" && (
          <div className="grid gap-2 rounded-xl border-l-4 border-brand bg-brand/5 p-4">
            <strong className="text-sm">Validação do WhatsApp</strong>
            <small className="text-xs leading-5 text-ink/55">
              Salve desligado, valide todos os grupos/canais e só então marque a
              ativação.
            </small>
            <Button
              type="button"
              disabled={validate.isPending}
              onClick={() => void validateWhatsApp()}
            >
              Validar destinos salvos
            </Button>
          </div>
        )}
        <Button disabled={update.isPending}>Salvar integração</Button>
      </form>
      {(notice || integrations.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (integrations.error instanceof Error
              ? integrations.error.message
              : "Não foi possível carregar integrações.")}
        </p>
      )}
    </Card>
  );
}
