import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  return (
    <header className="header">
      <div className="container nav">
        <Link className="brand" to="/">
          shop<span>sphere.</span>
        </Link>
        <nav>
          <NavLink to="/">Shop</NavLink>
          {user && <NavLink to="/account">My orders</NavLink>}
          {user?.role === "admin" && (
            <NavLink to="/admin">
              <LayoutDashboard size={16} /> Admin
            </NavLink>
          )}
        </nav>
        <div className="nav-actions">
          <Link className="cart-link" to="/cart">
            <ShoppingBag size={18} /> Cart ({count})
          </Link>
          {user ? (
            <button className="btn btn-ghost" onClick={logout}>
              <LogOut size={16} /> Sign out
            </button>
          ) : (
            <Link className="btn btn-dark" to="/login">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
