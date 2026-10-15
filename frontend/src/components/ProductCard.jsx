import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../services/api";

const ProductCard = ({ product, isWishlisted, onWishlistChange }) => {
  const { cartItems, addToCart } = useCart();
  const [wishlistStatus, setWishlistStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cartAdding, setCartAdding] = useState(false);
  const [cartError, setCartError] = useState("");

  const isSaved = isWishlisted || wishlistStatus === "saved";

  // Check if product is already in the global cart
  const itemInCart = cartItems.find(
    (item) => item.product?._id === product._id || item.product === product._id
  );
  const inCartQty = itemInCart ? itemInCart.quantity : 0;

  const handleAddToWishlist = async () => {
    if (wishlistStatus === "saving" || isSaved) return;

    setWishlistStatus("saving");
    setErrorMessage("");

    try {
      await API.post(`/wishlist/${product._id}`);
      setWishlistStatus("saved");
      if (onWishlistChange) onWishlistChange(product._id, true);
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistStatus("saved");
        if (onWishlistChange) onWishlistChange(product._id, true);
      } else {
        setWishlistStatus("error");
        setErrorMessage(
          err.response?.data?.message || "Unable to save product. Please try again."
        );
      }
    }
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0 || cartAdding) return;

    setCartAdding(true);
    setCartError("");

    const res = await addToCart(product._id);
    if (!res.success) {
      setCartError(res.message);
    }
    setCartAdding(false);
  };

  return (
    <article className="product-card">
      <button
        type="button"
        onClick={handleAddToWishlist}
        title={isSaved ? "Added to Wishlist" : "Add to Wishlist"}
        aria-label={isSaved ? "Added to wishlist" : "Add to wishlist"}
        className="product-wishlist-heart"
        disabled={wishlistStatus === "saving" || isSaved}
      >
        {isSaved ? "❤️" : "🤍"}
      </button>

      <Link to={`/products/${product._id}`} className="product-image-link">
        <span className="product-index">{product.category}</span>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
      </Link>

      <div className="product-card-body">
        <div className="product-card-heading">
          <h2>{product.name}</h2>
          <span className="product-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
        </div>

        <p className={product.stock > 0 ? "stock-status" : "stock-status out-of-stock"}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>

        {/* Wishlist Error */}
        {errorMessage && (
          <p className="product-wishlist-error">
            {errorMessage}
          </p>
        )}

        {/* Cart Error */}
        {cartError && (
          <p className="product-wishlist-error" style={{ color: "#dc2626" }}>
            {cartError}
          </p>
        )}

        <div className="product-card-actions">
          <Link
            to={`/products/${product._id}`}
            className="product-card-link"
          >
            <span>View details</span><span aria-hidden="true">↗</span>
          </Link>

          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={wishlistStatus === "saving" || isSaved}
            className={`product-card-wishlist${isSaved ? " is-saved" : ""}`}
          >
            {wishlistStatus === "saving" && "⏳ Saving..."}
            {isSaved && "♥ Saved"}
            {!isSaved && wishlistStatus === "idle" && "♡ Wishlist"}
            {wishlistStatus === "error" && "Retry ♡"}
          </button>
        </div>

        {/* Lab 05: Add to Cart Action */}
        <div style={{ marginTop: "10px" }}>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cartAdding || product.stock === 0}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "6px",
              fontWeight: "700",
              fontSize: "0.85rem",
              border: "none",
              backgroundColor: product.stock === 0 ? "#e5e7eb" : "#f59e0b",
              color: product.stock === 0 ? "#9ca3af" : "#000000",
              cursor: product.stock === 0 || cartAdding ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {product.stock === 0
              ? "Out of Stock"
              : cartAdding
              ? "⏳ Adding..."
              : inCartQty > 0
              ? `In Cart (${inCartQty}) — Add Another`
              : "Add to Cart 🛒"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;