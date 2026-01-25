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
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef(null);
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      navigate("/login");
      setIsProfileOpen(false);
    } catch (error) {
      toast.error("Failed to logout: " + error.response?.data?.message);
    }
  };

  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/shop", label: "Shop", icon: Store },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-lg shadow-lg shadow-gray-200/50"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <Package className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  E-Shop
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                  Premium Store
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 group ${
                      isActiveLink(link.path)
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </span>
                    {isActiveLink(link.path) && (
                      <span className="absolute inset-0 bg-blue-50 rounded-xl" />
                    )}
                    <span className="absolute inset-0 bg-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              {user ? (
                <>
                  {/* Favourites */}
                  <Link
                    to="/favourites"
                    className="relative p-2.5 text-gray-500 hover:text-pink-600 rounded-xl hover:bg-pink-50 transition-all duration-200 group"
                  >
                    <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {favouritesCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg shadow-pink-500/30 animate-pulse">
                        {favouritesCount}
                      </span>
                    )}
                  </Link>

                  {/* Cart */}
                  <Link
                    to="/cart"
                    className="relative p-2.5 text-gray-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg shadow-blue-500/30">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all duration-200 ${
                        isProfileOpen
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    <div
                      className={`absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all duration-200 ${
                        isProfileOpen
                          ? "opacity-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 -translate-y-2 pointer-events-none"
                      }`}
                    >
                      {/* Profile Header */}
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-sm text-white/80 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {user.role === "admin" && (
                          <div className="mt-3 flex items-center gap-1.5 text-white/90 text-xs font-medium bg-white/20 backdrop-blur rounded-lg px-2.5 py-1.5 w-fit">
                            <Sparkles className="h-3.5 w-3.5" />
                            Admin Access
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        {user.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Admin Panel</span>
                          </Link>
                        )}
                        <div className="my-2 border-t border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              {user && (
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden fixed inset-x-0 top-16 bg-white/95 backdrop-blur-lg border-t border-gray-100 transition-all duration-300 ${
            isMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
          style={{ maxHeight: "calc(100vh - 4rem)", overflowY: "auto" }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Navigation Links */}
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActiveLink(link.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {user ? (
              <>
                {/* User Card */}
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-white/80 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Menu Items */}
                <div className="space-y-1 mb-4">
                  <Link
                    to="/favourites"
                    className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5" />
                      <span className="font-medium">Favourites</span>
                    </div>
                    {favouritesCount > 0 && (
                      <span className="bg-pink-100 text-pink-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {favouritesCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-5 w-5" />
                      <span className="font-medium">Shopping Cart</span>
                    </div>
                    {cartItemsCount > 0 && (
                      <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">Admin Panel</span>
                    </Link>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}

export default Navbar;
