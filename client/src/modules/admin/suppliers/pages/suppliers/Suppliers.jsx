import { useState, useMemo, useCallback, memo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  useGetAllSuppliers,
  useDeleteSupplier,
  useToggleSupplierStatus,
} from "../../slice/supplierSlice";
import Sidebar from "../../../components/sidebar/Sidebar";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import toast from "react-hot-toast";
import AddSupplier from "../../components/add-supplier/AddSupplier";
import EditSupplier from "../../components/edit-supplier/EditSupplier";

// ✅ Memoized table row component
const SupplierTableRow = memo(({ row }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className="py-4 px-6">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
});

SupplierTableRow.displayName = "SupplierTableRow";

function Suppliers() {
  const { data: suppliers, isLoading } = useGetAllSuppliers();
  const deleteSupplier = useDeleteSupplier();
  const toggleStatus = useToggleSupplierStatus();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Table states
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  // ✅ Memoized handlers
  const handleEdit = useCallback((supplier) => {
    setEditingSupplier(supplier);
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingSupplier(null);
  }, []);

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("Are you sure you want to delete this supplier?")) {
        deleteSupplier.mutate(id, {
          onSuccess: () => toast.success("Supplier deleted successfully"),
          onError: (error) => {
            toast.error(error?.response?.data?.message || "Delete failed");
          },
        });
      }
    },
    [deleteSupplier]
  );

  const handleToggleStatus = useCallback(
    (id) => {
      toggleStatus.mutate(id, {
        onSuccess: () => toast.success("Status updated successfully"),
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Status update failed");
        },
      });
    },
    [toggleStatus]
  );

  // ✅ Memoize columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">{getValue()}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <span className="text-gray-600">{getValue()}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => (
          <span className="text-gray-600">{getValue()}</span>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ getValue }) => {
          const company = getValue();
          return (
            <span className="text-gray-600">
              {company || <span className="text-gray-400">-</span>}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <button
            onClick={() => handleToggleStatus(row.original._id)}
            className="flex items-center gap-2"
          >
            {row.original.isActive ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium text-sm">
                  Active
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 text-sm">Inactive</span>
              </>
            )}
          </button>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleToggleStatus(row.original._id)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Toggle Status"
            >
              {row.original.isActive ? (
                <ToggleRight size={18} />
              ) : (
                <ToggleLeft size={18} />
              )}
            </button>
            <button
              onClick={() => handleEdit(row.original)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(row.original._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [handleEdit, handleDelete, handleToggleStatus]
  );

  // Initialize table
  const table = useReactTable({
    data: suppliers?.data || [],
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
              <p className="text-gray-500 mt-1">
                Manage your suppliers and their information
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Supplier
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search suppliers..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
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
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider"
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className={
                                  header.column.getCanSort()
                                    ? "flex items-center gap-2 cursor-pointer select-none hover:text-blue-600"
                                    : ""
                                }
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {header.column.getCanSort() && (
                                  <span className="text-gray-400">
                                    {header.column.getIsSorted() === "asc" ? (
                                      <ChevronUp size={16} />
                                    ) : header.column.getIsSorted() ===
                                      "desc" ? (
                                      <ChevronDown size={16} />
                                    ) : (
                                      <ChevronsUpDown size={16} />
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
                  <tbody className="divide-y divide-gray-200">
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="py-12 text-center text-gray-500"
                        >
                          <Search
                            size={48}
                            className="mx-auto text-gray-300 mb-4"
                          />
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {globalFilter
                              ? "No suppliers found"
                              : "No suppliers yet"}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {globalFilter
                              ? `No results for "${globalFilter}"`
                              : "Get started by adding your first supplier"}
                          </p>
                          {globalFilter ? (
                            <button
                              onClick={() => setGlobalFilter("")}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Clear search
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                              <Plus size={20} />
                              Add Your First Supplier
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      table
                        .getRowModel()
                        .rows.map((row) => (
                          <SupplierTableRow key={row.id} row={row} />
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {table.getRowModel().rows.length > 0 && (
              <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-semibold">
                      {table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                        1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) *
                          table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {table.getFilteredRowModel().rows.length}
                    </span>{" "}
                    results
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: table.getPageCount() },
                      (_, i) => i
                    ).map((pageIndex) => (
                      <button
                        key={pageIndex}
                        onClick={() => table.setPageIndex(pageIndex)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          table.getState().pagination.pageIndex === pageIndex
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {pageIndex + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Supplier Modal */}
        <AddSupplier
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />

        {/* Edit Supplier Modal */}
        <EditSupplier
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          supplier={editingSupplier}
        />
      </div>
    </div>
  );
}

export default Suppliers;
