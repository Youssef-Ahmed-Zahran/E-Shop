import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../modules/auth/slice/authSlice";

const PrivateRoute = ({ adminOnly = false }) => {
  const { data: userData, isLoading } = useCurrentUser();
  const user = userData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin only route and user is not admin, redirect to home
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // User is authenticated (and is admin if required), show the protected page
  return <Outlet />;
};

export default PrivateRoute;
