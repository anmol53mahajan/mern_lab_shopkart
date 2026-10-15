import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import API from "../services/api";

const OrderDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNewOrder = searchParams.get("success") === "true";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Order details could not be found.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="order-details-page">
        <div className="orders-state">Loading order details...</div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <div className="order-details-shell">
          <div className="order-details-alert" role="alert">
            {error}
          </div>
          <Link to="/orders" className="order-details-back-link">
            <span aria-hidden="true">←</span> Back to my orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-details-page">
      <div className="order-details-shell">
      {/* Success banner if redirected from checkout */}
      {isNewOrder && (
        <div className="order-success-banner" role="status">
          <span className="order-success-mark" aria-hidden="true">✓</span>
          <div>
            <p className="eyebrow">All wrapped up</p>
            <h1>Order placed successfully!</h1>
            <p>
            Thank you for shopping with ShopKart. Your order has been placed and is being prepared.
            </p>
          </div>
        </div>
      )}

      <header className="order-details-header">
        <div>
          <p className="eyebrow">Order reference</p>
          <h2>{order._id}</h2>
          <p className="order-date">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="order-status">
          {order.status}
        </span>
      </header>

      <div className="order-details-grid">
        {/* Purchased Items Snapshot */}
        <section className="order-details-card">
          <div className="order-details-card-heading">
            <div>
              <p className="eyebrow">The details</p>
              <h3>Items in your order</h3>
            </div>
            <span>{order.items.length.toString().padStart(2, "0")}</span>
          </div>
          <div className="order-details-items">
            {order.items.map((item, idx) => (
              <div key={`${item.product}-${idx}`} className="order-details-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="order-details-image"
                />
                <div className="order-details-item-info">
                  <p className="order-details-item-name">{item.name}</p>
                  <p className="order-details-item-meta">
                    ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                  </p>
                </div>
                <span className="order-details-item-total">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="order-details-total">
            <span>Total amount</span>
            <strong>
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </strong>
          </div>
        </section>

        {/* Delivery Address */}
        <section className="order-details-card order-address-card">
          <div>
            <div className="order-details-card-heading">
              <div>
                <p className="eyebrow">Sent with care to</p>
                <h3>Delivery address</h3>
              </div>
              <span aria-hidden="true">⌖</span>
            </div>
            <p className="order-address-name">{order.shippingAddress.fullName}</p>
            <p className="order-address-line">{order.shippingAddress.addressLine1}</p>
            <p className="order-address-line">
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p className="order-address-phone">
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          <div className="order-details-actions">
            <Link
              to="/orders"
              className="order-secondary-button"
            >
              All orders
            </Link>
            <Link
              to="/products"
              className="order-primary-button"
            >
              Continue shopping <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
      </div>
    </main>
  );
};

export default OrderDetails;