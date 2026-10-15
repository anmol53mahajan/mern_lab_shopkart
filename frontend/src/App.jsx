import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import API from "./services/api";
import { CartProvider } from "./context/CartContext";

function App() {
  const [customer, setCustomer] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/customers/me");
        setCustomer(res.data);
      } catch {
        setCustomer(null);
      } finally {
        setInitialLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!customer) return;

    let isMounted = true;
    API.get("/wishlist")
      .then((res) => {
        if (isMounted && res.data?.success) {
          setWishlistIds(res.data.wishlist.map((product) => product._id));
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Unable to load wishlist:", err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [customer]);

  const handleWishlistChange = useCallback((productId, isWishlisted) => {
    setWishlistIds((currentIds) => {
      if (isWishlisted) {
        return currentIds.includes(productId)
          ? currentIds
          : [...currentIds, productId];
      }
      return currentIds.filter((id) => id !== productId);
    });
  }, []);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Initializing ShopKart...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <CartProvider customer={customer}>
        <div className="min-h-screen bg-slate-50">
          <Navbar
            customer={customer}
            setCustomer={setCustomer}
            wishlistIds={wishlistIds}
            setWishlistIds={setWishlistIds}
          />
          <Routes>
            <Route
              path="/"
              element={<Navigate to={customer ? "/products" : "/login"} replace />}
            />

            {/* Public Routes */}
            <Route path="/register" element={<Register customer={customer} />} />
            <Route
              path="/login"
              element={<Login customer={customer} setCustomer={setCustomer} />}
            />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute customer={customer}>
                  <Home customer={customer} setCustomer={setCustomer} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute customer={customer}>
                  <Products
                    wishlistIds={wishlistIds}
                    onWishlistChange={handleWishlistChange}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute customer={customer}>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute customer={customer}>
                  <Wishlist onWishlistChange={handleWishlistChange} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute customer={customer}>
                  <Cart />
                </ProtectedRoute>
              }
            />

            {/* Lab 06: Checkout & Order Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute customer={customer}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute customer={customer}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute customer={customer}>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;