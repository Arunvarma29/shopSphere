import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  ShoppingBag,
  UserRound,
  X,
  LogOut,
  LayoutDashboard,
} from "./Icons";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const close = () => setOpen(false);
  const signOut = async () => {
    await logout();
    close();
    navigate("/");
  };
  return (
    <>
      <div className="announcement">
        A little something good for every day <span>✳</span> Thoughtfully
        selected, always.
      </div>
      <header className="site-header">
        <button
          className="icon-btn mobile-menu"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>
        <Link to="/" className="brand" onClick={close}>
          <img className="brand-mark" src="/shopsphere-logo.svg" alt="" />
          shop<span>sphere</span>
          <i>.</i>
        </Link>
        <nav className="desktop-nav">
          <NavLink to="/shop">Shop all</NavLink>
          <a href="/#story">Our story</a>
          <a href="/#newsletter">Journal</a>
        </nav>
        <div className="header-actions">
          {user?.role === "admin" && (
            <Link
              className="icon-btn admin-shortcut"
              to="/admin"
              aria-label="Admin dashboard"
            >
              <LayoutDashboard />
            </Link>
          )}
          <Link
            className="icon-btn account-shortcut"
            to={user ? "/account" : "/login"}
            aria-label="Account"
          >
            <UserRound />
            <span>{user ? "" : "Sign in"}</span>
          </Link>
          <Link
            className="icon-btn bag-link"
            to="/cart"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingBag />
            <span className="bag-count">{count}</span>
          </Link>
          {user && (
            <button
              className="icon-btn signout-shortcut"
              onClick={signOut}
              aria-label="Sign out"
            >
              <LogOut />
              <span>Log out</span>
            </button>
          )}
        </div>
      </header>
      {open && (
        <div className="mobile-drawer-backdrop" onClick={close}>
          <aside className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top">
              <Link to="/" className="brand" onClick={close}>
                <img className="brand-mark" src="/shopsphere-logo.svg" alt="" />
                shop<span>sphere</span>
                <i>.</i>
              </Link>
              <button className="icon-btn" onClick={close}>
                <X />
              </button>
            </div>
            <NavLink onClick={close} to="/shop">
              Shop all
            </NavLink>
            <NavLink onClick={close} to="/cart">
              Your bag ({count})
            </NavLink>
            <NavLink onClick={close} to={user ? "/account" : "/login"}>
              {user ? "My account" : "Sign in"}
            </NavLink>
            {user?.role === "admin" && (
              <NavLink onClick={close} to="/admin">
                Admin dashboard
              </NavLink>
            )}
            {user && (
              <button className="mobile-drawer-logout" onClick={signOut}>
                <LogOut size={18} /> Log out
              </button>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
