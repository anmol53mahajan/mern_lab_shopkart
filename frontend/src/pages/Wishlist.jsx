import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import WishlistCard from "../components/WishlistCard";

const Wishlist = ({ onWishlistChange }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/wishlist");
      if (res.data.success) {
        setWishlist(res.data.wishlist);
        setError("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "We couldn't load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    API.get("/wishlist")
      .then((res) => {
        if (isMounted && res.data.success) {
          setWishlist(res.data.wishlist);
          res.data.wishlist.forEach((product) => {
            onWishlistChange(product._id, true);
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.response?.data?.message || "We couldn't load your wishlist."
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [onWishlistChange]);

  const handleRetry = () => {
    fetchWishlist();
  };

  const handleRemoveItem = async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      onWishlistChange(productId, false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove product from wishlist. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="wishlist-page">
        <div className="wishlist-state">
          <span className="loading-mark">S</span>
          <p>Loading your wishlist...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="wishlist-page">
        <section className="wishlist-state wishlist-error">
          <p className="eyebrow">A little hiccup</p>
          <h1>We couldn’t load your wishlist.</h1>
          <p>{error}</p>
          <button onClick={handleRetry} className="wishlist-primary-link" type="button">
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (wishlist.length === 0) {
    return (
      <main className="wishlist-page">
        <div className="wishlist-shell">
          <section className="wishlist-empty">
            <span className="wishlist-heart" aria-hidden="true">♡</span>
            <p className="eyebrow">Your personal edit</p>
            <h1>Your wishlist is waiting.</h1>
            <p>Save the things you love and they’ll be right here when you’re ready.</p>
            <Link to="/products" className="wishlist-primary-link">
              Explore products <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-shell">
        <header className="wishlist-header">
          <div>
            <p className="eyebrow">The things you love</p>
            <h1>My <span>wishlist.</span></h1>
            <p className="wishlist-intro">A little collection of good finds, saved for later.</p>
          </div>
          <div className="wishlist-count">
            <strong>{wishlist.length.toString().padStart(2, "0")}</strong>
            <span>{wishlist.length === 1 ? "item saved" : "items saved"}</span>
          </div>
        </header>

        <div className="wishlist-toolbar">
          <span>Saved for another day</span>
          <Link to="/products">Continue browsing <span aria-hidden="true">↗</span></Link>
        </div>

        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Wishlist;