import { useState } from "react";
import { Link } from "react-router-dom";

const WishlistCard = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(product._id);
    setRemoving(false);
  };

  return (
    <article className="wishlist-card">
      <Link
        to={`/products/${product._id}`}
        className="wishlist-image-link"
        aria-label={`View ${product.name}`}
      >
        <span className="wishlist-category">{product.category}</span>
        <img
          src={product.image}
          alt={product.name}
          className="wishlist-image"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/600x400?text=No+Image";
          }}
        />
      </Link>

      <div className="wishlist-card-body">
        <div className="wishlist-card-details">
          <h2>{product.name}</h2>
          <p className="wishlist-card-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>
          <p className={`wishlist-stock${product.stock > 0 ? "" : " out-of-stock"}`}>
            {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
          </p>
        </div>

        <div className="wishlist-card-actions">
          <Link
            to={`/products/${product._id}`}
            className="wishlist-view-link"
          >
            View details <span aria-hidden="true">↗</span>
          </Link>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="wishlist-remove-button"
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default WishlistCard;