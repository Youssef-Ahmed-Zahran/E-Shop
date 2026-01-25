import { Link } from "react-router-dom";
import LoginForm from "../../components/login-form/LoginForm";
import { Package } from "lucide-react";

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 mb-6 shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform duration-200"
            >
              <Package className="h-6 w-6 text-white" />
            </Link>
            <h2 className="text-3xl font-bold bg-gray-900 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Please sign in to access your account
            </p>
          </div>

          {/* Form Component */}
          <LoginForm />

          {/* Footer Section */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
