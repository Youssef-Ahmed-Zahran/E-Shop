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

// Admin Pages
import AdminDashboard from "./modules/admin/dashboard/pages/dashboard/Dashboard";
import AdminBrands from "./modules/admin/brands/pages/brands/Brands";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}

            {/* Auth routes - redirect to home if already logged in */}
            <Route element={<AuthRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes - require authentication */}
            <Route element={<PrivateRoute />}></Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/brands" element={<AdminBrands />} />
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
