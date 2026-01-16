import { useGetAllCategories } from "../../slice/categorySlice";
import { useGetAllBrands } from "../../slice/brandSlice";
import { Search, X } from "lucide-react";

function Filters({ filters, setFilters }) {
  const { data: categoriesData } = useGetAllCategories();
  const { data: brandsData } = useGetAllBrands();

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  const handleClearFilters = () => {
    setFilters({
      keyword: "",
      category: "",
      brand: "",
      page: 1,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={handleClearFilters}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) =>
              setFilters({ ...filters, keyword: e.target.value, page: 1 })
            }
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value, page: 1 })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand
        </label>
        <select
          value={filters.brand}
          onChange={(e) =>
            setFilters({ ...filters, brand: e.target.value, page: 1 })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand._id} value={brand._id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Filters;
