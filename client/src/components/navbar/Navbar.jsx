import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Package,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get current user
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await axios.get("/auth/me");
      return res.data.data;
    },
    retry: false,
  });

  // Get cart count
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axios.get("/carts");
      return res.data.data;
    },
    enabled: !!userData,
  });

  // Get favourites count
  const { data: favouritesData } = useQuery({
    queryKey: ["favourites"],
    queryFn: async () => {
      const res = await axios.get("/favourites");
      return res.data.data;
    },
    enabled: !!userData,
  });

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout" + error.message);
    }
  };

  const cartItemsCount = cartData?.items?.length || 0;
  const favouritesCount = favouritesData?.products?.length || 0;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">E-Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Shop
            </Link>
            {userData?.role === "admin" && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-700 hover:text-blue-600 transition">
              <Search className="h-5 w-5" />
            </button>

            {userData ? (
              <>
                {/* Favourites */}
                <Link
                  to="/favourites"
                  className="p-2 text-gray-700 hover:text-blue-600 transition relative"
                >
                  <Heart className="h-5 w-5" />
                  {favouritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {favouritesCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="p-2 text-gray-700 hover:text-blue-600 transition relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2 text-gray-700 hover:text-blue-600 transition"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-900">
                          {userData.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userData.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>

              {userData ? (
                <>
                  <Link
                    to="/favourites"
                    className="text-gray-700 hover:text-blue-600 transition flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5" />
                    <span>Favourites ({favouritesCount})</span>
                  </Link>
                  <Link
                    to="/cart"
                    className="text-gray-700 hover:text-blue-600 transition flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart ({cartItemsCount})</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {userData.role === "admin" && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-blue-600 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-red-600 hover:text-red-700 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
