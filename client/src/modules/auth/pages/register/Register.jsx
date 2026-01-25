import { Link } from "react-router-dom";
import RegisterForm from "../../components/register-form/RegisterForm";
import { Package } from "lucide-react";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Blobs (Optional: adds depth without clutter) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-400/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-400/5 blur-3xl" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <Link
              to="/"
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform duration-200"
            >
              <Package className="h-6 w-6" />
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Create your account
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Join us today and start shopping the latest trends.
            </p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
