import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Field,
  Input,
  LoadingCard,
  PanelHeader,
  Textarea,
} from "@mimelie/design-system";
import {
  useCreateCategory,
  useManagedCategories,
  useUpdateCategory,
} from "./hooks";
export function CategoryPanel() {
  const categories = useManagedCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [notice, setNotice] = useState("");
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createCategory.mutateAsync({
        name: String(form.get("name")),
        description: String(form.get("description") || "") || null,
        isActive: true,
      });
      event.currentTarget.reset();
      setNotice("Categoria criada e disponível no catálogo.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a categoria.",
      );
    }
  };
  const toggle = async (id: string, isActive: boolean) => {
    try {
      await updateCategory.mutateAsync({ id, input: { isActive: !isActive } });
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a categoria.",
      );
    }
  };
  const items = categories.data?.data ?? [];
  if (categories.isLoading)
    return (
      <Card className="p-5 sm:p-6">
        <PanelHeader eyebrow="Catálogo" title="Categorias" />
        <div className="mt-5 grid gap-2">
          <LoadingCard lines={1} />
          <LoadingCard lines={1} />
          <LoadingCard lines={1} />
        </div>
      </Card>
    );
  return (
    <Card className="p-5 sm:p-6">
      <PanelHeader
        eyebrow="Catálogo"
        title="Categorias"
        description="Organize como as ofertas aparecem para quem está buscando."
      />
      <div className="mt-5 grid gap-2">
        {items.map((item) => (
          <article
            className="flex items-center justify-between gap-4 rounded-xl border border-line p-4"
            key={item.id}
          >
            <div className="grid gap-1">
              <strong className="text-sm">{item.name}</strong>
              <small className="text-xs text-ink/50">
                {item.description || "Sem descrição"}
              </small>
            </div>
            <Button
              disabled={updateCategory.isPending}
              onClick={() => void toggle(item.id, item.isActive)}
            >
              {item.isActive ? "Desativar" : "Ativar"}
            </Button>
          </article>
        ))}
      </div>
      <form className="mt-6 grid max-w-xl gap-4" onSubmit={create}>
        <Field label="Nome">
          <Input
            name="name"
            required
            minLength={2}
            placeholder="Ex.: Games e consoles"
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            name="description"
            placeholder="Ajuda a organizar as ofertas"
          />
        </Field>
        <Button disabled={createCategory.isPending}>Criar categoria</Button>
      </form>
      {(notice || categories.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (categories.error instanceof Error
              ? categories.error.message
              : "Não foi possível carregar categorias.")}
        </p>
      )}
    </Card>
  );
}
