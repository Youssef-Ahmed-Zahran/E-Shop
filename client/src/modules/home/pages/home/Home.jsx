// Home.jsx
import Landing from "../../components/landing/Landing";
import FeaturedProducts from "../../components/featured-products/FeaturedProducts";
import CategoriesList from "../../components/categories-list/CategoriesList";

function Home() {
  return (
    <div className="bg-white">
      <Landing />
      <CategoriesList />
      <FeaturedProducts />
    </div>
  );
}

export default Home;
