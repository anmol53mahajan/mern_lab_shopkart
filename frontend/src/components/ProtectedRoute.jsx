import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ customer, children }) => {
  if (!customer) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;