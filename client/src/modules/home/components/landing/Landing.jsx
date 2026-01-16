// Landing.jsx
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

function Landing() {
  return (
    <div className="relative min-h-screen flex items-center">
      {/* Dynamic lifestyle image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Lifestyle shopping background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Shop Smarter.
            <span className="block text-blue-400">Live Better.</span>
          </h1>

          <p className="text-2xl text-gray-200 mb-12 leading-relaxed">
            Your one-stop destination for quality products that enhance your
            everyday life.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-lg font-semibold shadow-xl"
            >
              <ShoppingBag className="h-6 w-6" />
              Start Shopping
              <ArrowRight className="h-6 w-6" />
            </Link>

            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition text-lg font-semibold border border-white/30"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
