import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetOrderById,
  useUpdateOrderToPaid,
  useCancelOrder,
} from "../../slice/orderSlice";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import toast from "react-hot-toast";

function SingleOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: orderData, isLoading, error } = useGetOrderById(id);
  const updateOrderToPaid = useUpdateOrderToPaid();
  const cancelOrder = useCancelOrder();
  const [paymentAttempted, setPaymentAttempted] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const order = orderData?.data;

  // PayPal configuration
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
            value: order.totalAmount.toFixed(2),
            currency_code: "USD",
          },
          description: `Order #${order._id}`,
        },
      ],
    });
  };

  const onPayPalApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      setPaymentAttempted(true);
      updateOrderToPaid.mutate(
        {
          id: order._id,
          paymentResult: {
            id: details.id,
            status: details.status,
            update_time: details.update_time,
            email_address: details.payer.email_address,
          },
        },
        {
          onSuccess: () => {
            toast.success("Payment completed successfully!");
            // Refresh the order data
            setTimeout(() => window.location.reload(), 1000);
          },
          onError: (error) => {
            toast.error("Payment succeeded but failed to update order status");
            console.error("Update order error:", error);
          },
        }
      );
    });
  };

  const onPayPalError = (err) => {
    console.error("PayPal Error:", err);
    setPaymentAttempted(true);
    toast.error("Payment failed. Please try again or contact support.");
  };

  const onPayPalCancel = () => {
    toast.info("Payment cancelled");
  };

  const handleCancelOrder = () => {
    cancelOrder.mutate(order._id, {
      onSuccess: () => {
        toast.success("Order cancelled successfully");
        setShowCancelModal(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to cancel order");
        console.error("Cancel order error:", error);
      },
    });
  };

  const canCancelOrder = () => {
    // Can cancel if order is pending or processing and not yet delivered/shipped
    return (
      order &&
      order.orderStatus !== "cancelled" &&
      order.orderStatus !== "delivered" &&
      order.orderStatus !== "shipped"
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Order Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          {error?.message || "Unable to load order details"}
        </p>
        <button
          onClick={() => navigate("/profile/orders")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const showPaymentSection =
    order.paymentMethod === "PayPal" &&
    !order.isPaid &&
    order.orderStatus !== "cancelled";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cancel Order
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be
              undone.
              {order.isPaid &&
                " Your payment will be refunded within 5-7 business days."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                disabled={cancelOrder.isPending}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cancelOrder.isPending}
              >
                {cancelOrder.isPending ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/profile/orders")}
          className="text-blue-600 hover:underline flex items-center gap-2 mb-4"
        >
          ← Back to Orders
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-2">Order ID: {order._id}</p>
          </div>
          {canCancelOrder() && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cancelled Order Alert */}
          {order.orderStatus === "cancelled" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚫</span>
                <div>
                  <h3 className="font-bold text-red-900 mb-1">
                    Order Cancelled
                  </h3>
                  <p className="text-sm text-red-800">
                    This order has been cancelled.
                    {order.isPaid &&
                      " Your refund will be processed within 5-7 business days."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Failed Alert */}
          {paymentAttempted &&
            !order.isPaid &&
            order.orderStatus !== "cancelled" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">
                      Payment Failed
                    </h3>
                    <p className="text-sm text-red-800">
                      Your payment could not be processed. Please try again or
                      contact customer support if the issue persists.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Status
            </h2>
            <div className="flex items-center gap-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus.charAt(0).toUpperCase() +
                  order.orderStatus.slice(1)}
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  order.isPaid
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.isPaid ? "✓ Paid" : "⏳ Payment Pending"}
              </span>
            </div>
            {order.paidAt && (
              <p className="text-sm text-gray-600 mt-3">
                Paid on: {new Date(order.paidAt).toLocaleString()}
              </p>
            )}
            {order.deliveredAt && (
              <p className="text-sm text-gray-600">
                Delivered on: {new Date(order.deliveredAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={item.product?.name || "Product"}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.product?.name || "Product"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-gray-700">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state
                  ? `, ${order.shippingAddress.state}`
                  : ""}{" "}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Section - Only show if PayPal and not paid */}
          {showPaymentSection && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Complete Payment
              </h2>
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Your order is pending payment. Complete the payment below
                  to process your order.
                </p>
              </div>

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
                  }}
                  disabled={updateOrderToPaid.isPending}
                />
              </PayPalScriptProvider>

              <p className="text-sm text-gray-500 text-center mt-4">
                🔒 Secure payment powered by PayPal
              </p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 border-b pb-4 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
              <span>Total</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {order.isPaid && order.paymentResult && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  Payment Details
                </h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>Transaction ID: {order.paymentResult.id}</p>
                  <p>Status: {order.paymentResult.status}</p>
                  {order.paymentResult.email_address && (
                    <p>Email: {order.paymentResult.email_address}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleOrder;
