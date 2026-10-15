import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { product, quantity } = item;
  if (!product) return null;

  const handleDecrease = async () => {
    if (updating) return;
    setUpdating(true);
    setErrorMsg("");
    try {
      const res = quantity === 1
        ? await removeFromCart(product._id)
        : await updateQuantity(product._id, quantity - 1);
      if (!res.success) setErrorMsg(res.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (quantity >= product.stock || updating) return;
    setUpdating(true);
    setErrorMsg("");
    const res = await updateQuantity(product._id, quantity + 1);
    if (!res.success) setErrorMsg(res.message);
    setUpdating(false);
  };

  const handleRemove = async () => {
    if (updating) return;
    setUpdating(true);
    const res = await removeFromCart(product._id);
    if (!res.success) setErrorMsg(res.message);
    setUpdating(false);
  };

  const itemTotal = (product.price || 0) * quantity;

  return (
    <article className="cart-item">
      <Link
        to={`/products/${product._id}`}
        className="cart-item-image-link"
        aria-label={`View ${product.name}`}
      >
        <img
            src={product.image}
            alt={product.name}
            className="cart-item-image"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/300x240?text=No+Image";
            }}
        />
      </Link>

      <div className="cart-item-info">
        <p className="cart-item-category">{product.category}</p>
        <Link to={`/products/${product._id}`} className="cart-item-name">
            {product.name}
        </Link>
        <p className="cart-item-unit-price">
            ₹{Number(product.price).toLocaleString("en-IN")} <span>each</span>
        </p>
      </div>

      <div className="cart-item-controls">
        <div className="cart-item-quantity">
            <button
              onClick={handleDecrease}
              disabled={updating}
              type="button"
              aria-label={
                quantity === 1
                  ? `Remove ${product.name} from cart`
                  : `Decrease ${product.name} quantity`
              }
              title={quantity === 1 ? "Remove item from cart" : "Decrease quantity"}
            >
              &minus;
            </button>
            <span aria-live="polite">
              {updating ? "..." : quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={quantity >= product.stock || updating}
              type="button"
              aria-label={`Increase ${product.name} quantity`}
            >
              +
            </button>
        </div>
        <span className="cart-item-total">
            ₹{itemTotal.toLocaleString("en-IN")}
        </span>
        <button
            onClick={handleRemove}
            disabled={updating}
            className="cart-item-remove"
            type="button"
        >
            {updating ? "Updating..." : "Remove"}
        </button>
      </div>

      {errorMsg && (
        <p className="cart-item-error" role="alert">{errorMsg}</p>
      )}
    </article>
  );
};

export default CartItem;