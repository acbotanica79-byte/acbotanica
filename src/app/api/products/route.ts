import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/products";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}
