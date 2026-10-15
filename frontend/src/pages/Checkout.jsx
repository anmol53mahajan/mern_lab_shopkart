import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../services/api";

// Helper function to load Razorpay checkout script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalCount, clearCartState } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Guard against empty cart access
  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <span className="cart-empty-mark" aria-hidden="true">
            S
          </span>
          <p className="eyebrow">Nothing to check out yet</p>
          <h1>Your cart is empty.</h1>
          <p>Add something you love and come back when you’re ready.</p>
          <Link to="/products" className="cart-primary-button">
            Browse products <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!formData.addressLine1.trim())
      newErrors.addressLine1 = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must contain 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || submitting) return;

    setSubmitting(true);
    setServerError("");

    // 1. Load Razorpay SDK
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setServerError("Failed to load Razorpay payment SDK. Please check your internet connection.");
      setSubmitting(false);
      return;
    }

    try {
      // 2. Request backend to validate cart and create Razorpay order
      const orderRes = await API.post("/orders/create-payment-order", {
        shippingAddress: formData,
      });

      const {
        shopKartOrderId,
        razorpayOrderId,
        amount,
        currency,
        key,
      } = orderRes.data;

      // 3. Configure Razorpay Checkout options
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "ShopKart",
        description: "Order Payment",
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        theme: {
          color: "#f59e0b",
        },
        // Callback executed upon successful payment completion in modal
        handler: async function (response) {
          try {
            // 4. Verify HMAC SHA-256 signature on the server
            const verifyRes = await API.post("/orders/verify-payment", {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              clearCartState(); // Update frontend cart context to 0 items
              navigate(`/orders/${shopKartOrderId}?success=true`);
            }
          } catch (verifyErr) {
            setServerError(
              verifyErr.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        setServerError(`Payment Failed: ${response.error?.description || "Transaction declined."}`);
        setSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Failed to initiate payment. Please check item stock and try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <main className="checkout-page">
      <div className="checkout-shell">
        <header className="checkout-header">
          <p className="eyebrow">Almost there</p>
          <h1>
            Checkout<span>.</span>
          </h1>
          <p>One last step before your thoughtful finds are on their way.</p>
        </header>

        {serverError && (
          <div className="checkout-alert" role="alert">
            {serverError}
          </div>
        )}

        <div className="checkout-layout">
          {/* Shipping Address Form */}
          <section className="checkout-card checkout-address-card">
            <div className="checkout-section-heading">
              <span className="checkout-step">01</span>
              <div>
                <p className="eyebrow">Where should we send it?</p>
                <h2>Shipping details</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="checkout-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Aarav Sharma"
                  autoComplete="name"
                  className={`checkout-input${errors.fullName ? " has-error" : ""}`}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="checkout-field-error">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="checkout-field-grid">
                <div className="checkout-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    autoComplete="tel"
                    className={`checkout-input${errors.phone ? " has-error" : ""}`}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="checkout-field-error">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="checkout-field">
                  <label htmlFor="pincode">Pincode (6 digits)</label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="560001"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={`checkout-input${errors.pincode ? " has-error" : ""}`}
                    aria-invalid={Boolean(errors.pincode)}
                    aria-describedby={errors.pincode ? "pincode-error" : undefined}
                  />
                  {errors.pincode && (
                    <p id="pincode-error" className="checkout-field-error">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>

              <div className="checkout-field">
                <label htmlFor="addressLine1">Street Address</label>
                <input
                  id="addressLine1"
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="22 MG Road, Floor 3"
                  autoComplete="street-address"
                  className={`checkout-input${errors.addressLine1 ? " has-error" : ""}`}
                  aria-invalid={Boolean(errors.addressLine1)}
                  aria-describedby={errors.addressLine1 ? "addressLine1-error" : undefined}
                />
                {errors.addressLine1 && (
                  <p id="addressLine1-error" className="checkout-field-error">
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              <div className="checkout-field-grid">
                <div className="checkout-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Bengaluru"
                    autoComplete="address-level2"
                    className={`checkout-input${errors.city ? " has-error" : ""}`}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? "city-error" : undefined}
                  />
                  {errors.city && (
                    <p id="city-error" className="checkout-field-error">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div className="checkout-field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Karnataka"
                    autoComplete="address-level1"
                    className={`checkout-input${errors.state ? " has-error" : ""}`}
                    aria-invalid={Boolean(errors.state)}
                    aria-describedby={errors.state ? "state-error" : undefined}
                  />
                  {errors.state && (
                    <p id="state-error" className="checkout-field-error">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="checkout-submit"
              >
                <span>
                  {submitting
                    ? "Opening Razorpay..."
                    : "Pay with Razorpay (Test Mode)"}
                </span>
                <span aria-hidden="true">→</span>
              </button>
            </form>
          </section>

          {/* Final Order Review Summary */}
          <aside className="checkout-card checkout-review-card">
            <div className="checkout-section-heading checkout-review-heading">
              <span className="checkout-step">02</span>
              <div>
                <p className="eyebrow">The details</p>
                <h2>Your order</h2>
              </div>
            </div>
            <p className="checkout-item-count">
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </p>

            <div className="checkout-review-items">
              {cartItems.map((item) => (
                <div key={item.product?._id} className="checkout-review-item">
                  <div>
                    <p className="checkout-review-name">{item.product?.name}</p>
                    <p className="checkout-review-quantity">Qty: {item.quantity}</p>
                  </div>
                  <span className="checkout-review-price">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-total">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <p className="checkout-shipping-note">
              Secure payments powered by Razorpay Test Mode.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;