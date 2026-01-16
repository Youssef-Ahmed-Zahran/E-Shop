import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Store,
  Settings,
  Package,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  useCurrentUser,
  useLogoutUser,
} from "../../modules/auth/slice/authSlice";
import { useGetUserCart } from "../../modules/cart/slice/cartSlice";
import { useGetUserFavourites } from "../../modules/favourites/slice/favouriteSlice";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: userData } = useCurrentUser();
  const user = userData?.data;

  const { data: cartData } = useGetUserCart();
  const cartItemsCount =
    cartData?.data?.items?.reduce((total, item) => {
      return total + (item.quantity || 0);
    }, 0) || 0;
    
  const { data: favouritesData } = useGetUserFavourites();
  const favouritesCount = favouritesData?.data?.products?.length || 0;

  const logoutMutation = useLogoutUser();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      navigate("/login");
      setIsProfileOpen(false);
    } catch (error) {
      toast.error("Failed to logout" + error.response?.data?.message);
    }
  };

  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">E-Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActiveLink("/")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Home className="inline-block h-4 w-4 mr-2" />
              Home
            </Link>
            <Link
              to="/shop"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActiveLink("/shop")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Store className="inline-block h-4 w-4 mr-2" />
              Shop
            </Link>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Favourites */}
                <Link
                  to="/favourites"
                  className="p-2 text-gray-600 hover:text-pink-600 relative transition hover:bg-pink-50 rounded-lg"
                >
                  <Heart className="h-5 w-5" />
                  {favouritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                      {favouritesCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="p-2 text-gray-600 hover:text-blue-600 relative transition hover:bg-blue-50 rounded-lg"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.role === "admin" && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                            Admin
                          </span>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Profile
                        </Link>
                        {user.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition"
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
          <div className="md:hidden border-t border-gray-100 py-3 bg-white">
            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center px-4 py-3 rounded-lg mx-2 transition ${
                  isActiveLink("/")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Link>
              <Link
                to="/shop"
                className={`flex items-center px-4 py-3 rounded-lg mx-2 transition ${
                  isActiveLink("/shop")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Store className="h-5 w-5 mr-3" />
                Shop
              </Link>

              {user && (
                <>
                  {/* User Info */}
                  <div className="px-4 py-3 mx-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <Link
                    to="/favourites"
                    className="flex items-center justify-between px-4 py-3 mx-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 mr-3" />
                      Favourites
                    </div>
                    {favouritesCount > 0 && (
                      <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded-full">
                        {favouritesCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    className="flex items-center justify-between px-4 py-3 mx-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-3" />
                      Cart
                    </div>
                    {cartItemsCount > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 mx-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-4 py-3 mx-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 mx-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </>
              )}

              {!user && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-3 mx-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center px-4 py-3 mx-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
