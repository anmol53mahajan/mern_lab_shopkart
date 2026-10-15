import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children, customer }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync cart whenever the authenticated customer changes
  const fetchCart = async () => {
    if (!customer) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/cart");
      if (res.data.success) {
        setCartItems(res.data.cart);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [customer]);

  // Derived Values
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  // Add to cart action
  const addToCart = async (productId) => {
    try {
      const res = await API.post(`/cart/${productId}`);
      if (res.data.success) {
        setCartItems(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add to cart.";
      return { success: false, message };
    }
  };

  // Update quantity action
  const updateQuantity = async (productId, newQuantity) => {
    try {
      const res = await API.patch(`/cart/${productId}`, { quantity: newQuantity });
      if (res.data.success) {
        setCartItems(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update quantity.";
      return { success: false, message };
    }
  };

  // Remove from cart action
  const removeFromCart = async (productId) => {
    try {
      const res = await API.delete(`/cart/${productId}`);
      if (res.data.success) {
        setCartItems(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to remove item.";
      return { success: false, message };
    }
  };

  // Lab 06: Instantly clear global cart state upon successful order placement
  const clearCartState = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        totalCount,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};