import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useGetAllCategories } from "../../../shop/slice/categorySlice";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";

function CategoriesList() {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Fetch all categories without pagination for carousel
  const { data, isLoading } = useGetAllCategories({ 
    page: 1, 
    limit: 100 // Get more categories for scrolling
  });
  
  const categories = data?.data || [];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) return null;
  if (categories.length === 0) return null;

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <p className="text-gray-600 mt-1">Browse our wide range of categories</p>
          </div>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/shop?category=${category._id}`}
                className="flex-shrink-0 w-48 bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition group/card"
              >
                <div className="aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition duration-300"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-blue-600 group-hover/card:scale-110 transition duration-300" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 text-center group-hover/card:text-blue-600 transition">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          )}
        </div>

        {/* Scroll Indicators (dots) */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(categories.length / 5) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollContainerRef.current) {
                  const scrollAmount = scrollContainerRef.current.clientWidth * index;
                  scrollContainerRef.current.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth'
                  });
                }
              }}
              className="w-2 h-2 rounded-full bg-gray-300 hover:bg-blue-600 transition"
              aria-label={`Scroll to section ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default CategoriesList;