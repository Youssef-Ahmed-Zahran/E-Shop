/**
 * Centralized Query Keys for React Query
 * This file contains all query keys used across the application
 * to avoid circular dependencies between slices
 * 
 * ## 🚨 How to Use This File:
 * ## ✅ Benefits of This Refactor:
1. **No Circular Dependencies** - All slices import from the same centralized file
2. **Single Source of Truth** - All query keys defined in one place
3. **Easy Maintenance** - Update a key once, applies everywhere
4. **Type Safety** - Can easily add TypeScript types to `QUERY_KEYS`
5. **Cross-Slice Invalidation** - Order slice can now safely invalidate product queries
6. **Scalable** - Easy to add new query keys as your app grows
 */

export const QUERY_KEYS = {
  // Products
  PRODUCTS: ["products"],
  PRODUCT: ["product"],
  FEATURED_PRODUCTS: ["featuredProducts"],
  PRODUCT_STOCK: ["productStock"],

  // Orders
  ORDERS: ["orders"],
  ORDER: ["order"],
  MY_ORDERS: ["myOrders"],
  PAYPAL_CONFIG: ["paypalConfig"],

  // Favourites
  FAVOURITES: ["favourites"],
  CHECK_FAVOURITE: ["checkFavourite"],

  // Cart
  CART: ["cart"],

  // Auth
  AUTH_USER: ["authUser"],

  // Suppliers
  SUPPLIERS: ["suppliers"],
  SUPPLIER: ["supplier"],

  // Reviews
  PRODUCT_REVIEWS: ["productReviews"],
  MY_REVIEWS: ["myReviews"],
  ALL_REVIEWS: ["allReviews"],

  // Users
  USERS: ["users"],
  USER: ["user"],

  // Brands
  BRANDS: ["brands"],
  BRAND: ["brand"],

  // Categories
  CATEGORIES: ["categories"],
  CATEGORY: ["category"],
};
