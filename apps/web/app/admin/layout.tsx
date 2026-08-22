import { privatePageMetadata } from '../../lib/seo';

export const metadata = privatePageMetadata('Painel administrativo', 'Área restrita de operação da Mimelie.');
export default function AdminLayout({ children }: { children: React.ReactNode }) { return children; }
