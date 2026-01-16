import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Tag,
  Truck,
  FileText,
  Star,
} from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/admin/categories", icon: FolderTree, label: "Categories" },
    { path: "/admin/brands", icon: Tag, label: "Brands" },
    { path: "/admin/suppliers", icon: Truck, label: "Suppliers" },
    {
      path: "/admin/purchase-invoices",
      icon: FileText,
      label: "Purchase Invoices",
    },
    { path: "/admin/reviews", icon: Star, label: "Reviews" },
    { path: "/admin/users", icon: Users, label: "Users" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
