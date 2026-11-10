import { PageLayout } from "./PageLayout.js";
import { Card } from "./Surface.js";

export function NotFoundPage({ homeHref = "/", homeLabel = "Voltar ao início", title = "Página não encontrada", description = "O endereço informado não existe ou pode ter sido movido." }: { homeHref?: string; homeLabel?: string; title?: string; description?: string }) {
  return <PageLayout className="grid min-h-screen place-items-center" width="reading"><Card className="w-full p-8 text-center shadow-[0_18px_46px_rgba(28,35,52,.08)] sm:p-10"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-lg font-semibold text-brand">404</span><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">{title}</h1><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-ink/58">{description}</p><a className="mt-7 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark" href={homeHref}>{homeLabel}</a></Card></PageLayout>;
}
