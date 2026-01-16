import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserCart } from "../../../cart/slice/cartSlice";
import { useCreateOrder } from "../../slice/orderSlice";
import ShippingForm from "../../components/shipping-form/ShippingForm";
import OrderSummary from "../../components/order-summary/OrderSummary";
import Payment from "../../components/payment/Payment";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react";

function Order() {
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [step, setStep] = useState("checkout");
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const { data: cartData, isLoading: isCartLoading } = useGetUserCart();
  const cart = cartData?.data;
  const createOrderMutation = useCreateOrder();

  // Calculate prices
  const subtotal = orderDetails?.subtotal || cart?.totalPrice || 0;
  const shipping = orderDetails?.shipping || 10;
  const tax = orderDetails?.tax || subtotal * 0.1;
  const total = orderDetails?.total || subtotal + shipping + tax;

  const handlePlaceOrder = async (e) => {
    e?.preventDefault();

    // Validation
    if (
      !shippingAddress.street?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.zipCode?.trim() ||
      !shippingAddress.country?.trim()
    ) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const orderItems = cart.items
        .map((item) => ({
          product: item.product?._id || item.productId,
          quantity: item.quantity,
        }))
        .filter((item) => item.product);

      if (orderItems.length === 0) {
        toast.error("No valid products in cart");
        return;
      }

      const calculatedSubtotal = cart.totalPrice || 0;
      const calculatedShipping = 10;
      const calculatedTax = calculatedSubtotal * 0.1;

      const orderData = {
        items: orderItems,
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state || "",
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
        paymentMethod,
        shippingCost: calculatedShipping,
        taxAmount: calculatedTax,
      };

      const result = await createOrderMutation.mutateAsync(orderData);

      if (result?.data?._id) {
        const orderId = result.data._id;

        setCreatedOrderId(orderId);
        setOrderDetails({
          subtotal: calculatedSubtotal,
          shipping: calculatedShipping,
          tax: calculatedTax,
          total: calculatedSubtotal + calculatedShipping + calculatedTax,
        });

        if (paymentMethod === "PayPal") {
          setStep("payment");
          toast.success("Order created! Complete payment below.", {
            duration: 4000,
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          toast.success("Order placed successfully!");
          navigate(`/profile/orders`);
        }
      } else {
        toast.error("Failed to create order");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to place order"
      );
    }
  };

  // Loading State
  if (isCartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (step === "checkout" && (!cart || cart.items.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some amazing products to your cart before checking out
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            <Package className="h-5 w-5" />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {step === "checkout" ? "Checkout" : "Complete Payment"}
          </h1>
          <p className="text-gray-600">
            {step === "checkout"
              ? "Review your order and enter shipping details"
              : "Finalize your purchase securely"}
          </p>
        </div>

        {step === "checkout" ? (
          // CHECKOUT FORM
          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Shipping Address
                      </h2>
                      <p className="text-sm text-gray-600">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>
                  <ShippingForm
                    shippingAddress={shippingAddress}
                    setShippingAddress={setShippingAddress}
                  />
                </div>

                {/* Payment Method Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Payment Method
                      </h2>
                      <p className="text-sm text-gray-600">
                        Choose how you'd like to pay
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {["Cash on Delivery", "PayPal"].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === method
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-4 w-5 h-5 text-blue-600"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          {method === "Cash on Delivery" ? (
                            <Truck className="h-6 w-6 text-gray-600" />
                          ) : (
                            <img
                              src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                              alt="PayPal"
                              className="h-6"
                            />
                          )}
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 block">
                              {method}
                            </span>
                            <span className="text-sm text-gray-600">
                              {method === "Cash on Delivery"
                                ? "Pay when you receive your order"
                                : "Fast and secure online payment"}
                            </span>
                          </div>
                          {paymentMethod === method && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === "PayPal" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        You'll be redirected to complete your payment securely
                        with PayPal after placing your order
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <OrderSummary
                  items={cart?.items || []}
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                  isSubmitting={createOrderMutation.isPending}
                  submitButtonText="Place Order"
                />
              </div>
            </div>
          </form>
        ) : (
          // PAYMENT STEP
          <Payment
            orderId={createdOrderId}
            orderDetails={orderDetails}
            shippingAddress={shippingAddress}
          />
        )}
      </div>
    </div>
  );
}

export default Order;
