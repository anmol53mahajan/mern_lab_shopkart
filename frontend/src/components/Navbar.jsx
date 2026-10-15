import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../services/api";

const Navbar = ({ customer, setCustomer, wishlistIds = [], setWishlistIds }) => {
  const navigate = useNavigate();
  const { totalCount } = useCart();

  const handleLogout = async () => {
    try {
      await API.post("/customers/logout");
      setCustomer(null);
      if (setWishlistIds) setWishlistIds([]);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <div className="nav-row">
          <Link to={customer ? "/products" : "/login"} className="brand">
            <span className="brand-mark">S</span>
            <span>
              Shop<span className="brand-muted">Kart</span>
            </span>
          </Link>

          <div className="nav-actions">
            {customer ? (
              <>
                <Link to="/products" className="nav-link font-medium">
                  Products
                </Link>

                {/* Wishlist Link & Dynamic Count */}
                <Link
                  to="/wishlist"
                  className="nav-link font-medium"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span>Wishlist</span>
                  {wishlistIds?.length > 0 && (
                    <span
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        borderRadius: "9999px",
                        padding: "2px 7px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        lineHeight: 1,
                      }}
                    >
                      {wishlistIds.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="nav-link font-medium"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span>Cart</span>
                  {totalCount > 0 && (
                    <span
                      style={{
                        backgroundColor: "#f59e0b",
                        color: "#000000",
                        borderRadius: "9999px",
                        padding: "2px 7px",
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        lineHeight: 1,
                      }}
                    >
                      {totalCount}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="nav-link font-medium">
                  Orders
                </Link>
                <Link to="/home" className="nav-link font-medium">
                  Profile
                </Link>

                <span className="greeting">
                  Hi, {customer.fullName}
                </span>

                <button
                  onClick={handleLogout}
                  className="nav-button nav-button-danger"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="nav-button nav-button-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;