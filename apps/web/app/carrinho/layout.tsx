import { privatePageMetadata } from '../../lib/seo';

export const metadata = privatePageMetadata('Sua sacola', 'Produtos selecionados para sua compra na Mimelie.');
export default function CartLayout({ children }: { children: React.ReactNode }) { return children; }
