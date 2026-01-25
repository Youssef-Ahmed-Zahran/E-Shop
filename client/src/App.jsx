import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";

// ✅ Regular imports for critical/frequently used components
import Login from "./modules/auth/pages/login/Login";
import Register from "./modules/auth/pages/register/Register";
import Home from "./modules/home/pages/home/Home";
import Product from "./modules/product/pages/product/Product";
import Shop from "./modules/shop/pages/shop/Shop";

// Protected route components
import AuthRoute from "./components/protected-route/AuthRoute";
import PrivateRoute from "./components/protected-route/PrivateRoute";
import AdminRoute from "./components/protected-route/AdminRoute";

// ✅ Lazy load user routes (used less frequently)
const Cart = lazy(() => import("./modules/cart/pages/cart/Cart"));
const Favourite = lazy(() =>
  import("./modules/favourites/pages/favourite/Favourite")
);
const Order = lazy(() => import("./modules/order/pages/order/Order"));
const SingleOrder = lazy(() =>
  import("./modules/order/pages/single-order/SingleOrder")
);
const Profile = lazy(() => import("./modules/profile/pages/profile/Profile"));
const MyOrders = lazy(() =>
  import("./modules/profile/components/my-orders/MyOrders")
);
const MyReviews = lazy(() =>
  import("./modules/profile/components/my-reviews/MyReviews")
);

// ✅ Lazy load ALL admin routes (only admins need these)
const AdminDashboard = lazy(() =>
  import("./modules/admin/dashboard/pages/dashboard/Dashboard")
);
const AdminBrands = lazy(() =>
  import("./modules/admin/brands/pages/brands/Brands")
);
const AdminCategories = lazy(() =>
  import("./modules/admin/categories/pages/categories/Categories")
);
const AdminProducts = lazy(() =>
  import("./modules/admin/products/pages/products/Products")
);
const AddProduct = lazy(() =>
  import("./modules/admin/products/components/add-product/AddProduct")
);
const EditProduct = lazy(() =>
  import("./modules/admin/products/components/edit-product/EditProduct")
);
const AdminUsers = lazy(() =>
  import("./modules/admin/users/pages/users/Users")
);
const AdminReviews = lazy(() =>
  import("./modules/admin/reviews/pages/reviews/Reviews")
);
const AdminSuppliers = lazy(() =>
  import("./modules/admin/suppliers/pages/suppliers/Suppliers")
);
const AdminPurchaseInvoices = lazy(() =>
  import(
    "./modules/admin/purchase-invoices/pages/purchase-invoices/PurchaseInvoices"
  )
);
const AdminOrders = lazy(() =>
  import("./modules/admin/orders/pages/orders/Orders")
);

// ✅ Loading component with better UX
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
      </div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Loading...</p>
  </div>
);

// ✅ 404 Component
const NotFound = () => (
  <div className="container mx-auto px-4 py-16 text-center">
    <div className="max-w-md mx-auto">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back Home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {/* ✅ Wrap routes in Suspense for lazy loading */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes - NOT lazy loaded (critical for SEO/UX) */}
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/shop" element={<Shop />} />

              {/* Auth routes - redirect to home if already logged in */}
              <Route element={<AuthRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected routes - require authentication */}
              <Route element={<PrivateRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/favourites" element={<Favourite />} />
                <Route path="/order" element={<Order />} />
                <Route path="/order/:id" element={<SingleOrder />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/orders" element={<MyOrders />} />
                <Route path="/profile/reviews" element={<MyReviews />} />
              </Route>

              {/* Admin routes - ALL lazy loaded */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/brands" element={<AdminBrands />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/add" element={<AddProduct />} />
                <Route
                  path="/admin/products/edit/:id"
                  element={<EditProduct />}
                />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/suppliers" element={<AdminSuppliers />} />
                <Route
                  path="/admin/purchase-invoices"
                  element={<AdminPurchaseInvoices />}
                />
                <Route path="/admin/orders" element={<AdminOrders />} />
              </Route>

              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
