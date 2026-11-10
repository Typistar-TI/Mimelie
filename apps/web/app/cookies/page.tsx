import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal-page';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Política de cookies', description: 'Entenda e controle os cookies usados na loja Mimelie.', path: '/cookies' });
export default function CookiesPage() { return <LegalPage eyebrow="Cookies" title="Você escolhe os ingredientes digitais." intro="A loja usa o mínimo necessário para funcionar. Qualquer medição opcional só começa depois da sua autorização.">
  <section><h2>1. O que são cookies</h2><p>Cookies e tecnologias semelhantes guardam pequenas informações no navegador. Eles podem manter uma sessão segura, lembrar a sacola ou ajudar a entender como a loja é usada.</p></section>
  <section><h2>2. Essenciais</h2><p>São necessários para segurança, autenticação, funcionamento do checkout, prevenção de abuso, preferências de privacidade e continuidade da sacola. Como a loja não funciona corretamente sem eles, não dependem do consentimento para serem utilizados quando estritamente necessários.</p></section>
  <section><h2>3. Métricas de uso</h2><p>Quando autorizadas, as métricas registram eventos como páginas visitadas, desempenho e etapas do funil de compra. Na configuração atual, a Cloudflare Web Analytics é a métrica prevista para essa finalidade. Não ativamos essa categoria antes da sua escolha.</p></section>
  <section><h2>4. Publicidade</h2><p>A Mimelie não ativa cookies de publicidade comportamental nesta versão da loja. Se essa prática mudar, a categoria será apresentada separadamente antes da ativação e esta política será atualizada.</p></section>
  <section><h2>5. Como mudar sua escolha</h2><p>Use o botão “Configurar cookies” no rodapé a qualquer momento. Recusar métricas não impede navegar, adicionar itens à sacola ou comprar. Limpar os dados do navegador pode fazer o aviso aparecer novamente.</p></section>
  <section><h2>6. Duração</h2><p>A preferência de consentimento permanece no navegador até ser alterada ou removida. A duração de cookies técnicos e analíticos varia conforme sua finalidade e a configuração do fornecedor, sempre limitada ao necessário.</p></section>
  <section><h2>7. Fale com a gente</h2><p>Para dúvidas sobre estas tecnologias ou sobre o tratamento de dados, escreva para <a href="mailto:privacidade@mimelie.com.br">privacidade@mimelie.com.br</a>.</p></section>
</LegalPage>; }
