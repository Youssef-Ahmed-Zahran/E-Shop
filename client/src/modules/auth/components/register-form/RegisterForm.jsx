import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useRegisterUser } from "../../../../modules/auth/slice/authSlice";

// ✅ FIX: Defined OUTSIDE the main component
const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
    </div>
    <input
      {...props}
      className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm"
    />
  </div>
);

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const registerMutation = useRegisterUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      await registerMutation.mutateAsync(dataToSend);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="sr-only">
          Full Name
        </label>
        <InputField
          icon={User}
          id="name"
          name="name"
          type="text"
          required
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <InputField
          icon={Mail}
          id="email"
          name="email"
          type="email"
          required
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="sr-only">
          Phone number
        </label>
        <InputField
          icon={Phone}
          id="phone"
          name="phone"
          type="tel"
          placeholder="Phone number (Optional)"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* Address Field */}
      <div>
        <label htmlFor="address" className="sr-only">
          Address
        </label>
        <InputField
          icon={MapPin}
          id="address"
          name="address"
          type="text"
          placeholder="Shipping Address (Optional)"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          {registerMutation.isPending ? (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Creating account...
            </div>
          ) : (
            <div className="flex items-center">
              Create account
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center leading-relaxed px-4">
        By clicking Create account, you agree to our{" "}
        <a
          href="#"
          className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
        >
          Privacy Policy
        </a>
      </div>
    </form>
  );
};

export default RegisterForm;
