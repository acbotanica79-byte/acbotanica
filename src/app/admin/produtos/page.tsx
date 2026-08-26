import Link from "next/link";
import { Plus } from "lucide-react";
import { getProductsWithCost } from "@/lib/data/products";
import ProdutosClient from "@/components/admin/ProdutosClient";

export default async function AdminProdutosPage() {
  const products = await getProductsWithCost();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-verde-escuro">Produtos</h1>
          <p className="mt-1 text-sm text-verde-escuro/60">{products.length} cadastrados</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 rounded-full bg-verde-escuro px-5 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo"
        >
          <Plus size={16} /> Novo produto
        </Link>
      </div>

      <div className="mt-6">
        <ProdutosClient products={products} />
      </div>
    </div>
  );
}
