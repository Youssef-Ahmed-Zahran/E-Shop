import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../modules/auth/slice/authSlice";

// This route redirects authenticated users away from login/register pages
const AuthRoute = () => {
  const { data: userData, isLoading } = useCurrentUser();
  const user = userData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If not logged in, show the auth page (login/register)
  return <Outlet />;
};

export default AuthRoute;
