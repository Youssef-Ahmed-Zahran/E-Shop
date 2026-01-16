import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../modules/auth/slice/authSlice";

function AdminRoute() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Check if user exists and has admin role
  return user?.data?.role === "admin" ? <Outlet /> : <Navigate to="/" />;
}

export default AdminRoute;
