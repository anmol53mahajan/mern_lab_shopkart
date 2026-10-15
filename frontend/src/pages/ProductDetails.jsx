import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await API.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Product not found"
            : "Something went wrong while loading product details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-state">
          <span className="loading-mark">S</span>
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-error">
          <p>{error}</p>
          <Link to="/products" className="detail-back-link">
            &larr; Back to Products
          </Link>
        </div>
      </main>
    );
  }

  if (!product) return null;

  const inStock = Number(product.stock) > 0;
  const price = Number(product.price);

  // Check if item already exists in global cart
  const itemInCart = cartItems.find(
    (item) => item.product?._id === product._id || item.product === product._id
  );
  const inCartQty = itemInCart ? itemInCart.quantity : 0;
  const stockExceeded = inCartQty >= Number(product.stock);

  const handleAddToCart = async () => {
    if (!inStock || addingToCart || stockExceeded) return;

    setAddingToCart(true);
    setCartFeedback({ type: "", text: "" });

    const result = await addToCart(product._id);

    if (result.success) {
      setCartFeedback({
        type: "success",
        text: "Added to cart successfully!",
      });
    } else {
      setCartFeedback({
        type: "error",
        text: result.message || "Could not add item to cart.",
      });
    }

    setAddingToCart(false);
  };

  return (
    <main className="product-detail-page">
      <div className="product-detail-shell">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link to="/products">Products</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <Link to="/products" className="detail-back-link">
          <span aria-hidden="true">&larr;</span> Back to products
        </Link>

        <section className="product-detail-card" aria-labelledby="detail-product-name">
          <div className="detail-image-panel">
            <span className="detail-image-label">ShopKart select</span>
            <img
              src={product.image}
              alt={product.name}
              className="detail-product-image"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/600x400?text=No+Image";
              }}
            />
            <span className="detail-image-index">01 / PRODUCT</span>
          </div>

          <div className="detail-product-info">
            <p className="detail-category">{product.category}</p>
            <h1 id="detail-product-name">{product.name}</h1>
            <p className="detail-tagline">A thoughtful find for everyday living.</p>

            <div className="detail-price-row">
              <p className="detail-price">
                {Number.isFinite(price) ? `₹${price.toLocaleString("en-IN")}` : "Price unavailable"}
              </p>
              <span className={`detail-stock${inStock ? "" : " is-out-of-stock"}`}>
                <span aria-hidden="true" />
                {inStock ? `${product.stock} available` : "Out of stock"}
              </span>
            </div>

            <div className="detail-description">
              <h2>About this item</h2>
              <p>{product.description}</p>
            </div>

            <div className="detail-purchase">
              <button
                disabled={!inStock || addingToCart || stockExceeded}
                className="detail-add-button"
                type="button"
                onClick={handleAddToCart}
                style={{
                  cursor: !inStock || addingToCart || stockExceeded ? "not-allowed" : "pointer",
                  opacity: !inStock || stockExceeded ? 0.6 : 1,
                }}
              >
                {!inStock
                  ? "Currently unavailable"
                  : addingToCart
                  ? "Adding..."
                  : stockExceeded
                  ? `Max stock in cart (${inCartQty})`
                  : inCartQty > 0
                  ? `In Cart (${inCartQty}) — Add Another`
                  : "Add to cart"}
                {inStock && !addingToCart && !stockExceeded && (
                  <span aria-hidden="true">&rarr;</span>
                )}
              </button>

              {/* Action feedback message */}
              {cartFeedback.text && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    marginTop: "8px",
                    fontWeight: 600,
                    color: cartFeedback.type === "success" ? "#16a34a" : "#dc2626",
                  }}
                >
                  {cartFeedback.text}
                </p>
              )}

              <p className="detail-purchase-note">
                <span aria-hidden="true">✓</span>
                Carefully selected. Ready for your everyday.
              </p>
            </div>
          </div>
        </section>

        <p className="detail-footer-note">
          GOOD FINDS. BETTER EVERYDAY.
        </p>
      </div>
    </main>
  );
};

export default ProductDetails;