import { PageContainer } from '../../components/page-container';

export default function AdminPage() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:5174';
  return (
    <main className="min-h-[70vh] bg-[#fbebdc] py-20">
      <PageContainer className="grid place-items-center">
        <section className="w-full max-w-2xl rounded-[2rem] bg-[#fefbf3] p-7 md:p-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9f4d4d]">
            Operação
          </p>
          <h1 className="my-6 font-[family-name:var(--font-display)] text-6xl font-medium leading-[.88] md:text-7xl">
            Painel operacional.
          </h1>
          <p className="max-w-lg text-sm leading-6 text-[#765052]">
            A curadoria de ofertas, pedidos e produtos agora roda em um aplicativo separado,
            protegido pelo Cloudflare Access.
          </p>
          <a
            className="mt-8 inline-block rounded-full bg-[#542a30] px-7 py-4 text-xs font-extrabold text-white transition hover:bg-[#9f4d4d]"
            href={adminUrl}
          >
            Abrir o painel ↗
          </a>
        </section>
      </PageContainer>
    </main>
  );
}
