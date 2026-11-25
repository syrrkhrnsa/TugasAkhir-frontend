import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token"); // Cek apakah token ada


  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
