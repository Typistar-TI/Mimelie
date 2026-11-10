import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  LoadingCard,
  PanelHeader,
  TextButton,
} from "@mimelie/design-system";
import {
  useAutomationControl,
  useCreateRoutine,
  useRoutines,
  useRunRoutine,
  useUpdateAutomationControl,
  useUpdateRoutine,
} from "./hooks";
export function RoutinePanel() {
  const routines = useRoutines();
  const control = useAutomationControl();
  const createRoutine = useCreateRoutine();
  const updateRoutine = useUpdateRoutine();
  const runRoutine = useRunRoutine();
  const updateControl = useUpdateAutomationControl();
  const [notice, setNotice] = useState("");
  const paused = control.data?.data.paused ?? false;
  const items = routines.data?.data ?? [];
  if (routines.isLoading || control.isLoading)
    return (
      <Card className="p-5 sm:p-6">
        <PanelHeader eyebrow="Automação" title="Rotinas de publicação" />
        <div className="mt-5 grid gap-3">
          <LoadingCard lines={2} />
          <LoadingCard lines={2} />
          <LoadingCard className="h-72" />
        </div>
      </Card>
    );
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const number = (name: string) =>
      form.get(name) ? Number(form.get(name)) : undefined;
    const destinations = [
      "telegram",
      "whatsapp",
      "instagram",
      "facebook",
    ].filter((destination) => form.get(destination) === "on");
    try {
      await createRoutine.mutateAsync({
        name: String(form.get("name")),
        enabled: form.get("enabled") === "on",
        scheduleCron: String(form.get("scheduleCron")),
        dailyLimit: Number(form.get("dailyLimit")),
        filters: {
          keywords: String(form.get("keywords"))
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          categories: String(form.get("categories"))
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          minPrice: number("minPrice"),
          maxPrice: number("maxPrice"),
          minDiscount: number("minDiscount"),
        },
        destinations,
      });
      event.currentTarget.reset();
      setNotice(
        "Rotina criada. O worker agenda o cron informado em horário de Brasília.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a rotina.",
      );
    }
  };
  const toggleRoutine = async (id: string, enabled: boolean) => {
    try {
      await updateRoutine.mutateAsync({ id, input: { enabled } });
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a rotina.",
      );
    }
  };
  const run = async (id: string) => {
    try {
      await runRoutine.mutateAsync(id);
      setNotice(
        "Execução manual adicionada à fila; o worker a coleta em até um minuto.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível executar a rotina.",
      );
    }
  };
  const toggleAutomation = async () => {
    try {
      await updateControl.mutateAsync({ paused: !paused });
      setNotice(
        !paused
          ? "Automação geral pausada. Itens na fila ficam preservados."
          : "Automação geral retomada.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a automação geral.",
      );
    }
  };
  return (
    <Card className="p-5 sm:p-6">
      <PanelHeader
        eyebrow="Automação"
        title="Rotinas de publicação"
        description="Defina o que a operação procura e quando cada rotina pode publicar."
      />
      <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-brand/20 bg-brand-soft p-4 sm:flex-row sm:items-center">
        <div className="grid gap-1">
          <strong className="text-sm">
            {paused ? "Automação geral pausada" : "Automação geral ativa"}
          </strong>
          <small className="text-xs text-ink/55">
            {paused
              ? "O worker preserva a fila e não envia novos itens."
              : "Rotinas habilitadas usam o cron salvo em horário de Brasília."}
          </small>
        </div>
        <Button
          disabled={updateControl.isPending}
          onClick={() => void toggleAutomation()}
        >
          {paused ? "Retomar geral" : "Pausar geral"}
        </Button>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <article
            className="flex flex-col justify-between gap-3 rounded-xl bg-mist p-4 sm:flex-row sm:items-center"
            key={item.id}
          >
            <div className="grid gap-1">
              <strong className="text-sm">{item.name}</strong>
              <small className="text-xs text-ink/55">
                {item.scheduleCron} · {item.dailyLimit} ofertas/dia ·{" "}
                {item.enabled ? "ativa" : "pausada"}
              </small>
            </div>
            <span className="flex gap-3">
              <TextButton
                className="text-xs"
                disabled={runRoutine.isPending}
                onClick={() => void run(item.id)}
              >
                Executar
              </TextButton>
              <TextButton
                className="text-xs"
                disabled={updateRoutine.isPending}
                onClick={() => void toggleRoutine(item.id, !item.enabled)}
              >
                {item.enabled ? "Pausar" : "Retomar"}
              </TextButton>
            </span>
          </article>
        ))}
      </div>
      <form className="mt-6 grid max-w-3xl gap-4" onSubmit={create}>
        <Field label="Nome">
          <Input
            name="name"
            required
            minLength={3}
            placeholder="Tecnologia até R$ 2.000"
          />
        </Field>
        <Field
          label="Cron (Brasília)"
          hint="Ex.: 0 * * * * executa a cada hora."
        >
          <Input
            name="scheduleCron"
            required
            defaultValue="0 * * * *"
            pattern="\S+(\s+\S+){4}"
          />
        </Field>
        <Field label="Palavras-chave">
          <Input name="keywords" placeholder="fone, notebook, teclado" />
        </Field>
        <Field label="Categorias da fonte">
          <Input name="categories" placeholder="Tecnologia, Games" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Preço mínimo">
            <Input name="minPrice" type="number" min="1" />
          </Field>
          <Field label="Preço máximo">
            <Input name="maxPrice" type="number" min="1" />
          </Field>
          <Field label="Desconto mínimo (%)">
            <Input name="minDiscount" type="number" min="1" max="99" />
          </Field>
          <Field label="Limite diário">
            <Input
              name="dailyLimit"
              type="number"
              min="1"
              max="100"
              defaultValue="100"
            />
          </Field>
        </div>
        <fieldset className="flex flex-wrap gap-4 rounded-xl border border-line p-4">
          <legend>Destinos</legend>
          {["telegram", "whatsapp", "instagram", "facebook"].map(
            (destination) => (
              <Checkbox
                key={destination}
                name={destination}
                label={destination}
              />
            ),
          )}
        </fieldset>
        <Checkbox name="enabled" defaultChecked label="Ativar rotina" />
        <Button disabled={createRoutine.isPending}>Criar rotina</Button>
      </form>
      {(notice || routines.error || control.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (routines.error instanceof Error
              ? routines.error.message
              : control.error instanceof Error
                ? control.error.message
                : "Não foi possível carregar automações.")}
        </p>
      )}
    </Card>
  );
}
