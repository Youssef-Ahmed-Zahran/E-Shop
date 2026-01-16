import { useState } from "react";
import ProfileForm from "../../components/profile-form/ProfileForm";
import MyOrders from "../../components/my-orders/MyOrders";
import MyReviews from "../../components/my-reviews/MyReviews";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "orders"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reviews"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Reviews
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "profile" && <ProfileForm />}
        {activeTab === "orders" && <MyOrders />}
        {activeTab === "reviews" && <MyReviews />}
      </div>
    </div>
  );
};

export default Profile;
