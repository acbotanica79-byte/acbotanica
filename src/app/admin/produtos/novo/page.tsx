import ProductForm from "@/components/admin/ProductForm";

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Novo produto</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
