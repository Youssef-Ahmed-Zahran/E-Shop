import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";

// Auth pages
import Login from "./modules/auth/pages/login/Login";
import Register from "./modules/auth/pages/register/Register";

// Protected route components
import AuthRoute from "./components/protected-route/AuthRoute";
import PrivateRoute from "./components/protected-route/PrivateRoute";
import AdminRoute from "./components/protected-route/AdminRoute";

// Home module
import Home from "./modules/home/pages/home/Home";

// Product module
import Product from "./modules/product/pages/product/Product";

// Shop module
import Shop from "./modules/shop/pages/shop/Shop";

// Cart module
import Cart from "./modules/cart/pages/cart/Cart";

// Favourites module
import Favourite from "./modules/favourites/pages/favourite/Favourite";

// Admin Pages
import AdminDashboard from "./modules/admin/dashboard/pages/dashboard/Dashboard";
import AdminBrands from "./modules/admin/brands/pages/brands/Brands";
import AdminCategories from "./modules/admin/categories/pages/categories/Categories";
import AdminProducts from "./modules/admin/products/pages/products/Products";
import AddProduct from "./modules/admin/products/components/add-product/AddProduct";
import EditProduct from "./modules/admin/products/components/edit-product/EditProduct";
import AdminUsers from "./modules/admin/users/pages/users/Users";
import AdminReviews from "./modules/admin/reviews/pages/reviews/Reviews";
import AdminSuppliers from "./modules/admin/suppliers/pages/suppliers/Suppliers";
import AdminPurchaseInvoices from "./modules/admin/purchase-invoices/pages/purchase-invoices/PurchaseInvoices";
import AdminOrders from "./modules/admin/orders/pages/orders/Orders";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
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
            </Route>

            {/* Admin routes */}
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
            <Route
              path="*"
              element={
                <div className="container mx-auto px-4 py-16 text-center">
                  <h1 className="text-4xl font-bold mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="text-gray-600">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
