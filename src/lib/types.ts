export type Money = number;

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  parentSlug?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  photos?: string[];
}

export interface ProductQA {
  id: string;
  question: string;
  answer?: string;
  date: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  images: string[];
  /** Aviso discreto quando as fotos são da espécie (banco de imagens) e não do exemplar exato à venda. */
  photoNote?: string;
  price: Money;
  compareAtPrice?: Money;
  brandSlug: string;
  categorySlug: string;
  subcategory?: string;
  tags: string[];
  weightGrams?: number;
  dimensions?: { height: number; width: number; depth: number };
  material?: string;
  color?: string;
  environments?: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  qa: ProductQA[];
  relatedSlugs: string[];
  featured?: boolean;
  isNew?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  cta: string;
}

export interface Species {
  id: string;
  slug: string;
  popularName: string;
  scientificName: string;
  family: string;
  origin: string;
  toxicity: string;
  light: string;
  water: string;
  humidity: string;
  temperature: string;
  soil: string;
  fertilizing: string;
  propagation: string;
  bloom: string;
  funFacts: string[];
  images: string[];
  similarSlugs: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: string;
  readMinutes: number;
  date: string;
  relatedSlugs: string[];
}
