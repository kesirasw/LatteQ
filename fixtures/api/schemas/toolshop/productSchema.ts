import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

/**
 * Toolshop product schemas, from the OpenAPI contract (`ProductResponse`, `BrandResponse`,
 * `CategoryResponse`, `ImageResponse`, GET /products → `PaginatedProductResponse`).
 * The contract marks no field as required, so fields are optional; `strictObject` rejects undocumented fields.
 */

export const BrandSchema = z.strictObject({
  id: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
});

export const CategorySchema = z.strictObject({
  id: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  sub_categories: z.array(z.unknown()).optional(),
});

export const ImageSchema = z.strictObject({
  id: z.string().optional(),
  by_name: z.string().optional(),
  by_url: z.string().optional(),
  source_name: z.string().optional(),
  source_url: z.string().optional(),
  file_name: z.string().optional(),
  title: z.string().optional(),
});

/** `ProductSpecResponse` */
export const ProductSpecSchema = z.strictObject({
  id: z.string().optional(),
  product_id: z.string().optional(),
  spec_name: z.string().optional(),
  spec_value: z.string().optional(),
  spec_unit: z.string().nullable().optional(),
});

export const ProductSchema = z.strictObject({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  is_location_offer: z.boolean().optional(),
  is_rental: z.boolean().optional(),
  in_stock: z.boolean().optional(),
  co2_rating: z.string().optional(),
  is_eco_friendly: z.boolean().optional(),
  brand: BrandSchema.optional(),
  category: CategorySchema.optional(),
  product_image: ImageSchema.optional(),
  // FIXME: not in `ProductResponse`; GET /products/{productId} also returns the product's specs (live 2026-10-06, finding 18)
  specs: z.array(ProductSpecSchema).optional(),
});

/** GET /products/{productId}/related → 200 (list of `ProductResponse`) */
export const RelatedProductsSchema = z.array(ProductSchema);

/** GET /products → 200 */
export const PaginatedProductsSchema = z.strictObject({
  current_page: z.number().int().optional(),
  data: z.array(ProductSchema).optional(),
  // FIXME: contract says a number; an empty page (past the end, or a search with no matches) has null (live 2026-10-06)
  from: z.number().int().nullable().optional(),
  last_page: z.number().int().optional(),
  per_page: z.number().int().optional(),
  to: z.number().int().nullable().optional(),
  total: z.number().int().optional(),
});

export type Product = zOutput<typeof ProductSchema>;
export type PaginatedProducts = zOutput<typeof PaginatedProductsSchema>;
export type RelatedProducts = zOutput<typeof RelatedProductsSchema>;
