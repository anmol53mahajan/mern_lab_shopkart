import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

const Cart = () => {
  const { cartItems, loading, error, subtotal, totalCount, fetchCart } = useCart();

  // 1. Loading State
  if (loading && cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-state">
          <span className="loading-mark">S</span>
          <p>Loading your cart...</p>
        </div>
      </main>
    );
  }

  // 2. Error State
  if (error && cartItems.length === 0) {
    return (
      <main className="cart-page">
        <section className="cart-state cart-error">
          <p className="eyebrow">A little hiccup</p>
          <h1>We couldn’t load your cart.</h1>
          <p>{error}</p>
          <button onClick={fetchCart} className="cart-primary-button" type="button">
            Try again
          </button>
        </section>
      </main>
    );
  }

  // 3. Empty State
  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-shell">
          <section className="cart-empty">
            <span className="cart-empty-mark" aria-hidden="true">S</span>
            <p className="eyebrow">A good place to start</p>
            <h1>Your cart is waiting.</h1>
            <p>Discover something you love and it’ll be ready for you here.</p>
            <Link to="/products" className="cart-primary-button">
              Explore products <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  // 4. Cart List & Order Summary
  return (
    <main className="cart-page">
      <div className="cart-shell">
        <header className="cart-header">
          <div>
            <p className="eyebrow">Nearly yours</p>
            <h1>My <span>cart.</span></h1>
            <p className="cart-intro">Your considered collection, ready when you are.</p>
          </div>
          <div className="cart-count">
            <strong>{totalCount.toString().padStart(2, "0")}</strong>
            <span>{totalCount === 1 ? "item" : "items"}<br />in your cart</span>
          </div>
        </header>

        <div className="cart-toolbar">
          <span>Your selection</span>
          <Link to="/products">Continue browsing <span aria-hidden="true">↗</span></Link>
        </div>

        <div className="cart-layout">
          <section className="cart-items" aria-label="Items in your cart">
            {cartItems.map((item) => (
              <CartItem key={item.product?._id || item._id} item={item} />
            ))}
          </section>

          <aside className="cart-summary">
            <p className="eyebrow">The details</p>
            <h2>Order summary</h2>

            <div className="cart-summary-row">
              <span>Items ({totalCount} {totalCount === 1 ? "unit" : "units"})</span>
              <strong>{cartItems.length}</strong>
            </div>
            <div className="cart-summary-row cart-subtotal-row">
              <span>Subtotal</span>
              <strong>
                ₹{subtotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <p className="cart-shipping-note">Shipping and taxes calculated at checkout.</p>
            <Link
              to="/checkout"
              className="cart-checkout-button"
            >
              <span>Proceed to checkout</span>
              <span aria-hidden="true">→</span>
            </Link>
            <p className="cart-summary-footnote">
              <span aria-hidden="true">✓</span> Thoughtful finds, packed with care.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;