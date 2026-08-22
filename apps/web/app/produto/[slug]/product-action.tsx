'use client';
import type { Product } from '../../api/products';import{useCart}from'../../../components/cart-provider';
export function AddProduct({product,variant}:{product:Product;variant:Product['variants'][number]}){const cart=useCart();return <button className="w-full border border-[#542a30] bg-[#542a30] px-6 py-4 text-xs font-bold text-white hover:bg-[#9f4d4d]" onClick={()=>cart.add({variantId:variant.id,slug:product.slug,name:product.name,variant:variant.name,price:variant.price})}>Colocar na sacola</button>}
