import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useUpdateOrderToPaid } from "../../slice/orderSlice";
import OrderSummary from "../../components/order-summary/OrderSummary";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";

function Payment({ orderId, orderDetails, shippingAddress }) {
  const navigate = useNavigate();
  const updateOrderToPaid = useUpdateOrderToPaid();

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  const createPayPalOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: orderDetails.total.toFixed(2),
            currency_code: "USD",
            breakdown: {
              item_total: {
                value: orderDetails.subtotal.toFixed(2),
                currency_code: "USD",
              },
              shipping: {
                value: orderDetails.shipping.toFixed(2),
                currency_code: "USD",
              },
              tax_total: {
                value: orderDetails.tax.toFixed(2),
                currency_code: "USD",
              },
            },
          },
          description: `Order #${orderId}`,
        },
      ],
    });
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();

      await updateOrderToPaid.mutateAsync({
        id: orderId,
        paymentResult: {
          id: details.id,
          status: details.status,
          update_time: details.update_time,
          email_address: details.payer.email_address,
        },
      });

      toast.success("Payment completed successfully!");
      navigate(`/profile/orders`);
    } catch (error) {
      toast.error("Payment succeeded but failed to update order status");
      console.error("Update order error:", error);
      navigate(`/order/${orderId}`);
    }
  };

  const onPayPalError = (err) => {
    console.error("PayPal Error:", err);
    toast.error("Payment failed. Please try again.");
  };

  const onPayPalCancel = () => {
    toast.info(
      "Payment cancelled. You can complete payment later from your orders page."
    );
    navigate(`/order/${orderId}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(`/order/${orderId}`)}
        className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition"
      >
        <ArrowLeft className="h-4 w-4" />
        View order details
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Order Created Successfully!
              </h2>
              <p className="text-gray-600">
                Order ID:{" "}
                <span className="font-mono font-semibold">{orderId}</span>
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
                <Clock className="h-4 w-4" />
                Pending Payment
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Order Summary - Compact Version */}
          <div className="mb-6">
            <OrderSummary
              items={[]}
              subtotal={orderDetails.subtotal}
              shipping={orderDetails.shipping}
              tax={orderDetails.tax}
              total={orderDetails.total}
              showSubmitButton={false}
              isCompact={true}
            />
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              Shipping Address
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{shippingAddress.street}</p>
              <p>
                {shippingAddress.city}
                {shippingAddress.state ? `, ${shippingAddress.state}` : ""}{" "}
                {shippingAddress.zipCode}
              </p>
              <p>{shippingAddress.country}</p>
            </div>
          </div>

          {/* PayPal Payment */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              Complete Payment
            </h3>

            <PayPalScriptProvider options={initialOptions}>
              <PayPalButtons
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                onError={onPayPalError}
                onCancel={onPayPalCancel}
                style={{
                  layout: "vertical",
                  label: "pay",
                  shape: "rect",
                  color: "gold",
                  height: 55,
                }}
                disabled={updateOrderToPaid.isPending}
              />
            </PayPalScriptProvider>
          </div>

          {/* Security Info */}
          <div className="text-center space-y-3 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              🔒 Secure payment powered by PayPal
            </p>
            <p className="text-xs text-gray-500">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
