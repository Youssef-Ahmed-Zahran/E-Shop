import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  useGetAllBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "../../../../shop/slice/brandSlice";
import Sidebar from "../../../components/sidebar/Sidebar";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

function Brands() {
  // Pagination state
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const limit = 10; // Fixed page size

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch data with pagination
  const {
    data: brandsData,
    isLoading,
    isFetching,
  } = useGetAllBrands({
    page,
    limit,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const [showModal, setShowModal] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  // Extract data and pagination info
  const brands = brandsData?.data || [];
  const pagination = brandsData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalBrands: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Handle sorting change from table
  useEffect(() => {
    if (sorting.length > 0) {
      setSortBy(sorting[0].id);
      setSortOrder(sorting[0].desc ? "desc" : "asc");
      setPage(1);
    }
  }, [sorting]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingBrand) {
      updateBrand.mutate(
        { id: editingBrand._id, data: formData },
        {
          onSuccess: () => {
            toast.success("Brand updated successfully");
            resetForm();
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || "Update failed");
          },
        }
      );
    } else {
      createBrand.mutate(formData, {
        onSuccess: () => {
          toast.success("Brand created successfully");
          resetForm();
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Creation failed");
        },
      });
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({ name: "" });
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      deleteBrand.mutate(id, {
        onSuccess: () => {
          toast.success("Brand deleted successfully");
          if (brands.length === 1 && page > 1) {
            setPage(page - 1);
          }
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Delete failed");
        },
      });
    }
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Brand Name",
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">{getValue()}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ getValue }) => (
          <span className="text-gray-600">
            {new Date(getValue()).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ getValue }) => (
          <span className="text-gray-600">
            {new Date(getValue()).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
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
    []
  );

  // Initialize table
  const table = useReactTable({
    data: brands,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
  });

  // Generate page numbers to display
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
              <p className="text-gray-500 mt-1">
                Manage your product brands
                {pagination.totalBrands > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({pagination.totalBrands} total)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Brand
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search brands..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
            {isFetching && !isLoading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
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
            <div
              className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 ${
                isFetching ? "opacity-60" : ""
              }`}
            >
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
                                    {sorting.find(
                                      (s) => s.id === header.column.id
                                    )?.desc === false ? (
                                      <ChevronUp size={16} />
                                    ) : sorting.find(
                                        (s) => s.id === header.column.id
                                      )?.desc === true ? (
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
                    {brands.length === 0 ? (
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
                            {debouncedSearch
                              ? "No brands found"
                              : "No brands yet"}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {debouncedSearch
                              ? `No results for "${debouncedSearch}"`
                              : "Get started by adding your first brand"}
                          </p>
                          {debouncedSearch ? (
                            <button
                              onClick={() => setSearchInput("")}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Clear search
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                resetForm();
                                setShowModal(true);
                              }}
                              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                              <Plus size={20} />
                              Add Your First Brand
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="py-4 px-6">
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

            {/* Pagination */}
            {brands.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 rounded-lg shadow-md border border-gray-200">
                {/* Results info */}
                <span className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-semibold">
                    {(pagination.currentPage - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(
                      pagination.currentPage * limit,
                      pagination.totalBrands
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {pagination.totalBrands}
                  </span>{" "}
                  results
                </span>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                  {/* Previous button */}
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, index) =>
                      pageNum === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-2 text-gray-500"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pagination.currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingBrand ? "Edit Brand" : "Add New Brand"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter brand name"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={createBrand.isPending || updateBrand.isPending}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {createBrand.isPending || updateBrand.isPending
                        ? "Saving..."
                        : editingBrand
                        ? "Update Brand"
                        : "Create Brand"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={createBrand.isPending || updateBrand.isPending}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Brands;
