import { useState, useMemo, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  useGetAllProducts,
  useDeleteProduct,
  useUpdateProduct,
} from "../../../../product/slice/productSlice";
import Sidebar from "../../../components/sidebar/Sidebar";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  Search,
  ChevronsUpDown,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

// ✅ Memoized table row component
const ProductTableRow = memo(({ row }) => {
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

ProductTableRow.displayName = "ProductTableRow";

function Products() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // ✅ Fetch products with server-side pagination INCLUDING INACTIVE PRODUCTS
  const {
    data: productsData,
    isLoading,
    refetch,
  } = useGetAllProducts({
    page: pageIndex + 1,
    limit: pageSize,
    keyword: globalFilter || undefined,
    includeInactive: true, // ✅ Include inactive products
  });

  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  // ✅ Extract products and filter out deleted ones (isDeleted: true)
  const products = useMemo(() => {
    const allProducts = productsData?.data || [];
    // Filter out deleted products from the UI
    return allProducts.filter((product) => !product.isDeleted);
  }, [productsData]);

  const totalProducts = useMemo(() => {
    return productsData?.pagination?.total || 0;
  }, [productsData]);

  const pageCount = useMemo(() => {
    return productsData?.pagination?.pages || 1;
  }, [productsData]);

  // ✅ Memoized handlers
  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
        deleteProduct.mutate(id, {
          onSuccess: () => {
            toast.success("Product deleted successfully");
            // Force immediate refetch to remove from UI
            refetch();
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || "Failed to delete product"
            );
          },
        });
      }
    },
    [deleteProduct, refetch]
  );

  const handleToggleFeatured = useCallback(
    (product) => {
      const updatedData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category?._id,
        brand: product.brand?._id,
        stock: product.stock,
        isFeatured: !product.isFeatured,
        isActive: product.isActive,
      };

      updateProduct.mutate(
        { id: product._id, data: updatedData },
        {
          onSuccess: () => {
            toast.success(
              `Product ${
                !product.isFeatured ? "featured" : "unfeatured"
              } successfully`
            );
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || "Failed to update product"
            );
          },
        }
      );
    },
    [updateProduct]
  );

  // ✅ Handler to toggle active/inactive status
  const handleToggleActive = useCallback(
    (product) => {
      const updatedData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category?._id,
        brand: product.brand?._id,
        stock: product.stock,
        isFeatured: product.isFeatured,
        isActive: !product.isActive,
      };

      updateProduct.mutate(
        { id: product._id, data: updatedData },
        {
          onSuccess: () => {
            toast.success(
              `Product ${
                !product.isActive ? "activated" : "deactivated"
              } successfully`
            );
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || "Failed to update product"
            );
          },
        }
      );
    },
    [updateProduct]
  );

  // ✅ Memoize columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "images",
        header: "Image",
        cell: ({ row }) => (
          <div className="relative">
            <img
              src={row.original.images?.[0] || "/placeholder.png"}
              alt={row.original.name}
              className={`w-12 h-12 object-cover rounded-lg ${
                !row.original.isActive ? "opacity-40" : ""
              }`}
            />
            {!row.original.isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-red-600 bg-white px-1 rounded shadow">
                  OFF
                </span>
              </div>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue, row }) => (
          <span
            className={`font-medium ${
              row.original.isActive ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ getValue, row }) => (
          <span
            className={`font-semibold ${
              row.original.isActive ? "text-gray-900" : "text-gray-400"
            }`}
          >
            ${getValue()?.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ getValue, row }) => {
          const stock = getValue();
          return (
            <span
              className={`font-semibold ${
                !row.original.isActive
                  ? "text-gray-400"
                  : stock > 10
                  ? "text-green-600"
                  : stock > 0
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {stock}
            </span>
          );
        },
      },
      {
        accessorKey: "category.name",
        header: "Category",
        cell: ({ getValue, row }) => (
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              row.original.isActive
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {getValue() || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <button
            onClick={() => handleToggleActive(row.original)}
            className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
              row.original.isActive
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
            title={
              row.original.isActive
                ? "Click to deactivate"
                : "Click to activate"
            }
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </button>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleToggleFeatured(row.original)}
              disabled={!row.original.isActive}
              className={`p-2 rounded-lg transition-colors ${
                row.original.isFeatured
                  ? "text-yellow-500 hover:bg-yellow-50"
                  : "text-gray-400 hover:bg-gray-100"
              } ${
                !row.original.isActive ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={
                !row.original.isActive
                  ? "Activate product to feature it"
                  : row.original.isFeatured
                  ? "Unfeature"
                  : "Feature"
              }
            >
              <Star
                size={18}
                fill={row.original.isFeatured ? "currentColor" : "none"}
              />
            </button>
            <Link
              to={`/product/${row.original._id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View"
            >
              <Eye size={18} />
            </Link>
            <Link
              to={`/admin/products/edit/${row.original._id}`}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit size={18} />
            </Link>
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
    [handleDelete, handleToggleFeatured, handleToggleActive]
  );

  // ✅ Initialize table with manual pagination
  const table = useReactTable({
    data: products,
    columns,
    pageCount: pageCount,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  // ✅ Reset to first page when search changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    setPageIndex(0);
  };

  // ✅ Calculate pagination display values
  const startRow = totalProducts > 0 ? pageIndex * pageSize + 1 : 0;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalProducts);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-500 mt-1">
                Manage your product inventory
              </p>
            </div>
            <Link
              to="/admin/products/add"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Product
            </Link>
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
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

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
                    {products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="py-12 text-center text-gray-500"
                        >
                          No products found
                        </td>
                      </tr>
                    ) : (
                      table
                        .getRowModel()
                        .rows.map((row) => (
                          <ProductTableRow key={row.id} row={row} />
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {products.length > 0 && (
              <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-semibold">{startRow}</span> to{" "}
                    <span className="font-semibold">{endRow}</span> of{" "}
                    <span className="font-semibold">{totalProducts}</span>{" "}
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
                    {Array.from({ length: pageCount }, (_, i) => i).map((i) => (
                      <button
                        key={i}
                        onClick={() => table.setPageIndex(i)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          pageIndex === i
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {i + 1}
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
      </div>
    </div>
  );
}

export default Products;
