import { useGetAllOrders } from "../../../../order/slice/orderSlice";
import { useGetAllProducts } from "../../../../product/slice/productSlice";
import { useGetAllUsers } from "../../../../profile/slice/userSlice";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import Sidebar from "../../../components/sidebar/Sidebar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const { data: orders } = useGetAllOrders({ limit: 100 });
  const { data: products } = useGetAllProducts({ limit: 100 });
  const { data: users } = useGetAllUsers({ limit: 100 });

  const stats = {
    totalRevenue:
      orders?.data?.reduce((sum, order) => sum + order.totalAmount, 0) || 0,
    totalProducts: products?.pagination?.total || 0,
    totalOrders: orders?.pagination?.total || 0,
    totalUsers: users?.pagination?.total || 0,
  };

  const recentOrders = orders?.data?.slice(0, 5) || [];

  // Prepare revenue trend data (last 7 days)
  const getRevenueTrend = () => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayRevenue =
        orders?.data
          ?.filter((order) => {
            const orderDate = new Date(order.createdAt)
              .toISOString()
              .split("T")[0];
            return orderDate === dateStr;
          })
          .reduce((sum, order) => sum + order.totalAmount, 0) || 0;

      last7Days.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: parseFloat(dayRevenue.toFixed(2)),
        orders:
          orders?.data?.filter((order) => {
            const orderDate = new Date(order.createdAt)
              .toISOString()
              .split("T")[0];
            return orderDate === dateStr;
          }).length || 0,
      });
    }

    return last7Days;
  };

  // Prepare order status distribution
  const getOrderStatusData = () => {
    const statusCount = {};
    orders?.data?.forEach((order) => {
      const status = order.orderStatus || "pending";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  };

  // Prepare top products by stock
  const getTopProducts = () => {
    return (
      products?.data
        ?.sort((a, b) => b.stock - a.stock)
        .slice(0, 5)
        .map((product) => ({
          name:
            product.name.length > 20
              ? product.name.substring(0, 20) + "..."
              : product.name,
          stock: product.stock,
          price: product.price,
        })) || []
    );
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trend: "+12.5%",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+8.2%",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "+23.1%",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: "+5.4%",
    },
  ];

  const COLORS = {
    delivered: "#10b981",
    pending: "#3b82f6",
    processing: "#8b5cf6",
    cancelled: "#ef4444",
    shipped: "#f59e0b",
  };

  const revenueTrendData = getRevenueTrend();
  const orderStatusData = getOrderStatusData();
  const topProductsData = getTopProducts();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 p-8 lg:p-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-slate-600 ml-4">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}
              ></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${stat.iconBg} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={stat.iconColor} size={24} />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                    <TrendingUp size={14} />
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-2">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </p>
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                Revenue Trend
              </h3>
              <p className="text-sm text-slate-600">Last 7 days performance</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Order Status</h3>
              <p className="text-sm text-slate-600">Distribution by status</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name.toLowerCase()] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products by Stock */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden lg:col-span-2">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                Top Products by Stock
              </h3>
              <p className="text-sm text-slate-600">Inventory levels</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="stock" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Recent Orders
                </h2>
                <p className="text-slate-600 text-sm">
                  Latest transactions from your customers
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg">
                <span className="text-sm font-medium">View All</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {order.user?.name?.charAt(0) || "U"}
                        </div>
                        <span className="text-slate-700 font-medium">
                          {order.user?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          order.orderStatus === "delivered"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : order.orderStatus === "cancelled"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            order.orderStatus === "delivered"
                              ? "bg-emerald-500"
                              : order.orderStatus === "cancelled"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        ></span>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-500 font-medium">No orders yet</p>
                <p className="text-slate-400 text-sm mt-1">
                  Orders will appear here when customers make purchases
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
