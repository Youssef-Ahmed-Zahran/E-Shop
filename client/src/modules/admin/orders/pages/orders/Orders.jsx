import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  useGetAllOrders,
  useUpdateOrderStatus,
} from "../../../../order/slice/orderSlice";
import Sidebar from "../../../components/sidebar/Sidebar";
import {
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

function AdminOrders() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: "" });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const { data: orders, isLoading } = useGetAllOrders(filters);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (orderId, newStatus) => {
    updateStatus.mutate(
      { id: orderId, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Order status updated successfully");
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Failed to update status"
          );
        },
      }
    );
  };

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setFilters({ ...filters, status, page: 1 }); // Reset to page 1 and update API filter
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">#{getValue()}</span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Customer",
        cell: ({ row }) => (
          <span className="text-gray-900">
            {row.original.user?.name || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">
            ${getValue()?.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "isPaid",
        header: "Payment",
        cell: ({ getValue }) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              getValue()
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {getValue() ? "Paid" : "Unpaid"}
          </span>
        ),
      },
      {
        accessorKey: "orderStatus",
        header: "Status",
        cell: ({ getValue, row }) => (
          <select
            value={getValue()}
            onChange={(e) =>
              handleStatusChange(row.original._id, e.target.value)
            }
            className={`px-3 py-1.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(
              getValue()
            )}`}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-gray-900">
            {new Date(getValue()).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Link
            to={`/order/${row.original._id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-block transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </Link>
        ),
        enableSorting: false,
      },
    ],
    [handleStatusChange]
  );

  // Initialize table (NO client-side pagination, only server-side)
  const table = useReactTable({
    data: orders?.data || [],
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Remove getPaginationRowModel - we're using server-side pagination
    manualPagination: true, // Tell table we're handling pagination manually
  });

  // Pagination info from API
  const pagination = orders?.pagination || {};
  const currentPage = pagination.page || 1;
  const totalPages = pagination.pages || 1;
  const total = pagination.total || 0;

  // Calculate displayed range
  const startIndex = (currentPage - 1) * filters.limit + 1;
  const endIndex = Math.min(currentPage * filters.limit, total);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display (max 5 pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track all orders</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-64">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className={
                                  header.column.getCanSort()
                                    ? "flex items-center gap-2 cursor-pointer select-none hover:text-gray-700"
                                    : ""
                                }
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {header.column.getCanSort() && (
                                  <span>
                                    {header.column.getIsSorted() === "asc" ? (
                                      <ChevronUp size={14} />
                                    ) : header.column.getIsSorted() ===
                                      "desc" ? (
                                      <ChevronDown size={14} />
                                    ) : (
                                      <ChevronsUpDown size={14} />
                                    )}
                                  </span>
                                )}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination - Server Side */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex}</span> to{" "}
                  <span className="font-medium">{endIndex}</span> of{" "}
                  <span className="font-medium">{total}</span> results
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
