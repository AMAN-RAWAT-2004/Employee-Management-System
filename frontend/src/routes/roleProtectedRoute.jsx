import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/taskManagement" replace />;
  }
  return <Outlet />;
};

export default RoleProtectedRoute;
