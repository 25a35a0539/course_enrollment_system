import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (allowedRole && userRole !== allowedRole) return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;