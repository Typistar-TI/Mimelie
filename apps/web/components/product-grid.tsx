'use client';
import Link from 'next/link';
import { formatBRL } from '@mimelie/ui';
import { useProducts, type Product } from '../app/api/products';
import { useCart } from './cart-provider';
const colors = ['bg-[#fbebdc]', 'bg-[#edbfb3]', 'bg-[#eec0a2]'];
export function ProductGrid({ initialProducts }: { initialProducts: Product[] }) {
  const cart = useCart(); const { data: products = initialProducts } = useProducts(initialProducts);
  return <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">{products.map((product,index)=>{const variant=product.variants[0];if(!variant)return null;return <article className="flex flex-col" key={product.id}><Link href={`/produto/${product.slug}`} className={`relative grid h-[450px] place-items-center overflow-hidden border border-[#eec0a2] ${colors[index%colors.length]}`}><span className="relative grid aspect-[.78] w-[48%] place-items-center border border-[#542a30] bg-[#fefbf3] shadow-[12px_14px_0_rgba(84,42,48,.18)] transition duration-500 hover:-translate-y-2 hover:rotate-2"><i className="absolute inset-3 border border-[#c3866b]"/><b className="font-[family-name:var(--font-display)] text-8xl font-medium text-[#c3866b]">{product.name[0]}</b></span></Link><div className="flex justify-between gap-4 py-5"><div><p className="mb-2 text-[9px] uppercase tracking-[.17em]">{product.category}</p><h3 className="mb-2 font-[family-name:var(--font-display)] text-3xl font-semibold"><Link href={`/produto/${product.slug}`}>{product.name}</Link></h3><small className="block max-w-xs leading-6 text-[#8c5b59]">{product.shortDescription}</small></div><strong className="whitespace-nowrap text-xs">{formatBRL(variant.price)}</strong></div><button className="mt-auto w-full border border-[#542a30] px-5 py-4 text-xs font-bold transition hover:bg-[#542a30] hover:text-white" onClick={()=>cart.add({variantId:variant.id,slug:product.slug,name:product.name,variant:variant.name,price:variant.price})}>Colocar na sacola</button></article>})}</div>;
}
