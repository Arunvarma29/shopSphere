import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_URL, currency, getErrorMessage } from "../config";

export default function Checkout() {
  const { user, accessToken } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!items.length)
    return (
      <main className="page-shell">
        <div className="empty-state">
          <h2>Your bag is empty.</h2>
          <Link to="/shop" className="button button-dark">
            Back to shop
          </Link>
        </div>
      </main>
    );
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_URL}/orders`,
        {
          items: items.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
          shippingAddress: form,
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      clearCart();
      navigate("/account", {
        replace: true,
        state: { orderPlaced: response.data.order?._id },
      });
    } catch (err) {
      setError(getErrorMessage(err, "We could not place your order."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="page-shell checkout-page">
      <Link className="back-link" to="/cart">
        <ArrowLeft size={16} /> Back to bag
      </Link>
      <div className="page-intro compact-intro">
        <p className="eyebrow">ALMOST YOURS</p>
        <h1>
          Let's get it <em>to you.</em>
        </h1>
        <p>A few details and your good finds will be on their way.</p>
      </div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <h2>Delivery details</h2>
          <div className="form-grid">
            <label className="span-two">
              Full name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Phone number
              <input
                required
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label>
              PIN code
              <input
                required
                inputMode="numeric"
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
              />
            </label>
            <label className="span-two">
              Address line 1
              <input
                required
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
            </label>
            <label className="span-two">
              Address line 2 (optional)
              <input
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
            </label>
            <label>
              City
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label>
              State
              <input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-dark full-button" disabled={busy}>
            {busy ? "Placing your order..." : "Place order · Cash on delivery"}
          </button>
          <p className="secure-note">
            <LockKeyhole size={14} /> Your order is sent securely to ShopSphere.
          </p>
        </form>
        <aside className="order-summary checkout-summary">
          <p className="eyebrow">YOUR ORDER</p>
          {items.map((item) => (
            <div className="checkout-line" key={item._id}>
              <span>
                {item.name} <small>× {item.quantity}</small>
              </span>
              <strong>{currency(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="summary-row">
            <span>Shipping</span>
            <strong>Free</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{currency(subtotal)}</strong>
          </div>
          <div className="cod-note">
            Cash on delivery <span>✓</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
