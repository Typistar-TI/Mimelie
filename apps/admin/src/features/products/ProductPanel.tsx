import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Field,
  Input,
  LoadingCard,
  PanelHeader,
  Select,
  useToast,
} from "@mimelie/design-system";
import { uploadFile } from "../../api/client";
import { createProduct } from "../../api/features/products/create-product";
import {
  listProducts,
  productsQueryKey,
  type AdminProduct,
} from "../../api/features/products/list-products";
import { updateProduct } from "../../api/features/products/update-product";

const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );

function imageUrl(key: string): string | null {
  if (key.startsWith("http")) return key;
  if (key.startsWith("products/")) return `/v1/media/${key}`;
  return null;
}

export function ProductPanel() {
  const queryClient = useQueryClient();
  const products = useQuery({
    queryKey: productsQueryKey,
    queryFn: listProducts,
  });
  const create = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminProduct["status"] }) =>
      updateProduct(id, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("image");
    setUploading(true);
    try {
      let images: Array<{ key: string; alt: string }> | undefined;
      if (file instanceof File && file.size > 0) {
        const uploaded = await uploadFile(file);
        images = [{ key: uploaded.key, alt: String(form.get("name")) }];
      }
      await create.mutateAsync({
        name: String(form.get("name")),
        shortDescription: String(form.get("shortDescription")),
        category: String(form.get("category")),
        status: String(form.get("status")) === "ACTIVE" ? "ACTIVE" : "DRAFT",
        variants: [
          {
            sku: String(form.get("sku")),
            name: String(form.get("variantName")),
            price: Number(form.get("price")),
            stock: Number(form.get("stock")),
            weightGrams: Number(form.get("weightGrams") || 0),
          },
        ],
        images,
      });
      setNotice("Produto criado.");
      showToast({ title: "Produto criado", description: "Já aparece no catálogo se estiver ativo." });
      formElement.reset();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível criar o produto.",
      );
    } finally {
      setUploading(false);
    }
  };

  const items = products.data?.data ?? [];
  if (products.isLoading) {
    return (
      <Card className="p-5 sm:p-6">
        <PanelHeader eyebrow="Catálogo" title="Produtos" />
        <div className="mt-5 grid gap-3">
          <LoadingCard />
          <LoadingCard />
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Card className="p-5 sm:p-6">
        <PanelHeader
          eyebrow="Catálogo"
          title="Produtos"
          description="Cadastre a coleção própria, variantes, estoque e imagem principal."
        />
        <div className="mt-5 grid gap-3">
          {items.map((product) => {
            const src = product.images[0] ? imageUrl(product.images[0].key) : null;
            const variant = product.variants[0];
            return (
              <article
                className="grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-[16px] border border-line p-3"
                key={product.id}
              >
                <div className="grid size-16 place-items-center overflow-hidden rounded-[14px] bg-surface-subtle">
                  {src ? (
                    <img alt={product.name} className="h-full w-full object-cover" src={src} />
                  ) : (
                    <span className="font-mono text-[10px] text-ink/40">sem foto</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-ink/50">
                    {product.category} · {variant ? `${variant.sku} · ${brl(variant.price)} · ${variant.stock} un.` : "sem variante"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      product.status === "ACTIVE"
                        ? "bg-pine-soft text-pine"
                        : "bg-ink/6 text-ink/50"
                    }`}
                  >
                    {product.status === "ACTIVE" ? "Ativo" : "Rascunho"}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={update.isPending}
                    onClick={() =>
                      update.mutate({
                        id: product.id,
                        status: product.status === "ACTIVE" ? "DRAFT" : "ACTIVE",
                      })
                    }
                  >
                    {product.status === "ACTIVE" ? "Pausar" : "Publicar"}
                  </Button>
                </div>
              </article>
            );
          })}
          {!items.length ? (
            <p className="rounded-[14px] bg-surface-subtle px-4 py-6 text-sm text-ink/55">
              Nenhum produto cadastrado.
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <PanelHeader eyebrow="Novo" title="Cadastrar produto" />
        <form className="mt-5 grid gap-4" onSubmit={submit}>
          <Field label="Nome">
            <Input name="name" required maxLength={160} placeholder="Curva de Caramelo" />
          </Field>
          <Field label="Descrição curta">
            <Input
              name="shortDescription"
              required
              maxLength={280}
              placeholder="Leve, macio e desenhado para acompanhar o seu olhar."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria">
              <Input name="category" required maxLength={80} placeholder="Cílios" />
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue="DRAFT">
                <option value="DRAFT">Rascunho</option>
                <option value="ACTIVE">Ativo</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Variante">
              <Input name="variantName" required placeholder="Natural" />
            </Field>
            <Field label="SKU">
              <Input name="sku" required placeholder="CIL-CURVA-01" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Preço (R$)">
              <Input name="price" required type="number" min="0.01" step="0.01" placeholder="49.90" />
            </Field>
            <Field label="Estoque">
              <Input name="stock" required type="number" min="0" step="1" defaultValue="0" />
            </Field>
            <Field label="Peso (g)">
              <Input name="weightGrams" type="number" min="0" step="1" defaultValue="0" />
            </Field>
          </div>
          <Field label="Imagem principal" hint="JPG, PNG ou WebP até 5 MB.">
            <input accept="image/*" className="block w-full text-sm" name="image" type="file" />
          </Field>
          <Button disabled={create.isPending || uploading} type="submit">
            {uploading ? "Enviando imagem…" : create.isPending ? "Criando…" : "Criar produto"}
          </Button>
          {notice ? (
            <p className="rounded-[14px] bg-brand-soft px-4 py-3 text-sm text-ink">{notice}</p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
