import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { species } from "@/lib/data/species";
import { blogPosts } from "@/lib/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/produtos",
    "/categorias",
    "/promocoes",
    "/novidades",
    "/blog",
    "/guias",
    "/cuidados",
    "/especies",
    "/calculadoras",
    "/contato",
    "/conta",
    "/favoritos",
    "/carrinho",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = products.map((p) => ({
    url: `${SITE_URL}/produtos/${p.slug}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/categorias/${c.slug}`,
    lastModified: new Date(),
  }));

  const speciesRoutes = species.map((s) => ({
    url: `${SITE_URL}/especies/${s.slug}`,
    lastModified: new Date(),
  }));

  const blogRoutes = blogPosts.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...speciesRoutes, ...blogRoutes];
}
