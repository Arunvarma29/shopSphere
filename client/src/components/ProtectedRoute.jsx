import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";
export default function ProtectedRoute({ admin = false }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <Loader label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
