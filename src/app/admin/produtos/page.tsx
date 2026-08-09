import Link from "next/link";
import Image from "next/image";
import { Plus, ExternalLink } from "lucide-react";
import { getProductsWithCost } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";

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

      <div className="mt-6 overflow-x-auto rounded-2xl border border-verde-claro/30 bg-branco">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-verde-claro/20 text-left text-xs uppercase tracking-wide text-verde-escuro/50">
              <th className="p-4">Produto</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Custo</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Margem</th>
              <th className="p-4">Fornecedor</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const margin = p.costPrice != null ? p.price - p.costPrice : null;
              const marginPct = margin != null && p.price > 0 ? (margin / p.price) * 100 : null;
              return (
                <tr key={p.id} className="border-b border-verde-claro/10 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.images[0] && (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-areia">
                          <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                        </div>
                      )}
                      <span className="font-medium text-verde-escuro">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-verde-escuro/70">{p.categorySlug}</td>
                  <td className="p-4 text-verde-escuro/70">{p.costPrice != null ? formatPrice(p.costPrice) : "—"}</td>
                  <td className="p-4 font-medium text-verde-escuro">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    {margin != null ? (
                      <span className={margin >= 0 ? "text-verde-musgo" : "text-terracota"}>
                        {formatPrice(margin)}
                        {marginPct != null && (
                          <span className="text-verde-escuro/50"> ({marginPct.toFixed(0)}%)</span>
                        )}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">
                    {p.supplierUrl ? (
                      <a
                        href={p.supplierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-medium text-verde-musgo hover:text-verde-escuro"
                        title={p.supplierUrl}
                      >
                        Ver <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-verde-escuro/40">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/produtos/${p.id}/editar`}
                      className="text-sm font-semibold text-verde-musgo hover:text-verde-escuro"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
