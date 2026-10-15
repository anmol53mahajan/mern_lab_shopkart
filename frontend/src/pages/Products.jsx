import { useState, useEffect, useCallback } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["All", "Electronics", "Fashion", "Books", "Home"];

const Products = ({ wishlistIds, onWishlistChange }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (category && category !== "All") params.append("category", category);
      if (sort) params.append("sort", sort);

      const res = await API.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    // Debounce search slightly to avoid excessive calls on rapid keystrokes
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchProducts]);

  return (
    <main className="products-page">
      <div className="products-shell">
        <header className="products-header">
          <div>
            <p className="eyebrow">The ShopKart edit</p>
            <h1>Discover <span>better finds.</span></h1>
            <p className="products-intro">A considered collection for everyday living, chosen with you in mind.</p>
          </div>
          <div className="product-count"><strong>{products.length.toString().padStart(2, "0")}</strong><span>items<br />in view</span></div>
        </header>

        <section className="product-toolbar" aria-label="Product filters">
          <label className="search-field">
            <span>Search</span>
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="select-field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat === "All" ? "All categories" : cat}</option>
              ))}
            </select>
          </label>

          <label className="select-field">
            <span>Arrange</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
        </section>

      {loading && (
        <div className="products-state">
          <span className="loading-mark">S</span>
          <p>Curating your selection...</p>
        </div>
      )}

      {error && !loading && (
        <div className="products-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="products-state products-empty">
          <p>No products found.</p>
          <span>Try another search or browse all categories.</span>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isWishlisted={wishlistIds.includes(product._id)}
              onWishlistChange={onWishlistChange}
            />
          ))}
        </div>
      )}
      </div>
    </main>
  );
};

export default Products;