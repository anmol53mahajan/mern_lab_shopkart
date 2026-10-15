import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const loadOrderHistory = async () => {
  const res = await API.get("/orders");
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load order history.");
  }
  return res.data.orders;
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await loadOrderHistory());
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadOrderHistory()
      .then((loadedOrders) => {
        if (isMounted) setOrders(loadedOrders);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "Failed to load order history.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="orders-page">
        <div className="orders-state">Loading your orders...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <section className="orders-state orders-empty-state">
          <p className="eyebrow">A little hiccup</p>
          <h1>We couldn’t load your orders.</h1>
          <p>{error}</p>
          <button onClick={fetchOrders} className="orders-primary-button" type="button">
            Try again <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <section className="orders-state orders-empty-state">
          <span className="orders-empty-mark" aria-hidden="true">S</span>
          <p className="eyebrow">A good place to start</p>
          <h1>Your next favorite is out there.</h1>
          <p>You haven’t placed an order yet. Explore the collection to find something you love.</p>
          <Link to="/products" className="orders-primary-button">
            Start shopping <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="orders-shell">
        <header className="orders-header">
          <div>
            <p className="eyebrow">Your ShopKart history</p>
            <h1>My <span>orders.</span></h1>
            <p>Every thoughtful find, all in one place.</p>
          </div>
          <span className="orders-count">{orders.length.toString().padStart(2, "0")} orders</span>
        </header>

        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <p className="eyebrow">Order reference</p>
                  <h2>{order._id}</h2>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="order-card-actions">
                  <span className="order-status">{order.status}</span>
                  <Link to={`/orders/${order._id}`} className="order-details-link">
                    View details <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="order-card-items">
                {order.items.map((item, idx) => (
                  <div key={`${item.product}-${idx}`} className="order-card-item">
                    <span>{item.name} <span className="order-quantity">× {item.quantity}</span></span>
                    <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <div className="order-card-total">
                <span>Total paid</span>
                <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Orders;