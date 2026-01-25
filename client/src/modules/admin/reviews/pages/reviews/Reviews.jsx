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
  useGetAllReviews,
  useToggleReviewApproval,
  useDeleteReview,
  useBulkApproveReviews,
} from "../../../../profile/slice/reviewSlice.js";
import Sidebar from "../../../components/sidebar/Sidebar";
import {
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

// ✅ Memoized table row component
const ReviewTableRow = memo(({ row }) => {
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

ReviewTableRow.displayName = "ReviewTableRow";

function Reviews() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    isApproved: undefined,
  });
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const { data: reviews, isLoading } = useGetAllReviews(filters);
  const toggleApproval = useToggleReviewApproval();
  const deleteReview = useDeleteReview();
  const bulkApprove = useBulkApproveReviews();

  // ✅ Memoized handlers
  const handleToggleApproval = useCallback(
    (id) => {
      toggleApproval.mutate(id, {
        onSuccess: (data) => {
          toast.success(data.message);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Action failed");
        },
      });
    },
    [toggleApproval]
  );

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("Are you sure you want to delete this review?")) {
        deleteReview.mutate(id, {
          onSuccess: () => {
            toast.success("Review deleted successfully");
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || "Delete failed");
          },
        });
      }
    },
    [deleteReview]
  );

  const handleBulkApprove = useCallback(() => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to approve");
      return;
    }

    bulkApprove.mutate(selectedReviews, {
      onSuccess: (data) => {
        toast.success(data.message);
        setSelectedReviews([]);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Bulk approve failed");
      },
    });
  }, [selectedReviews, bulkApprove]);

  const toggleSelectReview = useCallback((id) => {
    setSelectedReviews((prev) =>
      prev.includes(id)
        ? prev.filter((reviewId) => reviewId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedReviews((prev) =>
      prev.length === reviews?.data?.length
        ? []
        : reviews?.data?.map((review) => review._id) || []
    );
  }, [reviews?.data]);

  // ✅ Memoize columns definition
  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            onChange={selectAll}
            checked={
              selectedReviews.length === reviews?.data?.length &&
              reviews?.data?.length > 0
            }
            className="cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedReviews.includes(row.original._id)}
            onChange={() => toggleSelectReview(row.original._id)}
            className="cursor-pointer"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "product.name",
        header: "Product",
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">
            {getValue() || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "User",
        cell: ({ getValue }) => (
          <span className="text-gray-600">{getValue() || "N/A"}</span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ getValue }) => {
          const rating = getValue();
          return (
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "comment",
        header: "Comment",
        cell: ({ getValue }) => (
          <span className="text-gray-600 max-w-xs truncate block">
            {getValue() || "-"}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "isApproved",
        header: "Status",
        cell: ({ getValue }) => (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              getValue()
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {getValue() ? "Approved" : "Pending"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
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
              onClick={() => handleToggleApproval(row.original._id)}
              className={`p-2 rounded-lg transition-colors ${
                row.original.isApproved
                  ? "text-yellow-600 hover:bg-yellow-50"
                  : "text-green-600 hover:bg-green-50"
              }`}
              title={
                row.original.isApproved ? "Unapprove review" : "Approve review"
              }
            >
              {row.original.isApproved ? (
                <XCircle size={18} />
              ) : (
                <CheckCircle size={18} />
              )}
            </button>
            <button
              onClick={() => handleDelete(row.original._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete review"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [
      selectedReviews,
      reviews?.data,
      selectAll,
      toggleSelectReview,
      handleToggleApproval,
      handleDelete,
    ]
  );

  // Initialize table
  const table = useReactTable({
    data: reviews?.data || [],
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
            <p className="text-gray-500 mt-1">
              Manage customer reviews and ratings
            </p>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search reviews..."
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

            <div>
              <select
                value={
                  filters.isApproved === undefined
                    ? ""
                    : filters.isApproved.toString()
                }
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    isApproved:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true",
                    page: 1,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Reviews</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 flex justify-between items-center">
            <span className="text-blue-900 font-medium">
              {selectedReviews.length} review
              {selectedReviews.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={bulkApprove.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {bulkApprove.isPending ? "Approving..." : "Bulk Approve"}
              </button>
              <button
                onClick={() => setSelectedReviews([])}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

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
                              ? "No reviews found"
                              : "No reviews yet"}
                          </h3>
                          <p className="text-gray-500">
                            {globalFilter
                              ? `No results for "${globalFilter}"`
                              : "Reviews will appear here once customers leave feedback"}
                          </p>
                          {globalFilter && (
                            <button
                              onClick={() => setGlobalFilter("")}
                              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Clear search
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      table
                        .getRowModel()
                        .rows.map((row) => (
                          <ReviewTableRow key={row.id} row={row} />
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
      </div>
    </div>
  );
}

export default Reviews;
