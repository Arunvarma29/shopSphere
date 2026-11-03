import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";


export default function CheckoutPage() {
  const { items, total, clear } = useCart(),
    { user } = useAuth(),
    nav = useNavigate();
  const [address, setAddress] = useState({
      name: user?.name || "",
      phone: "",
      line1: "",
      city: "",
      state: "",
      postalCode: "",
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await http.post("/orders", {
        items: items.map((x) => ({ productId: x._id, quantity: x.quantity })),
        shippingAddress: address,
      });
      clear();
      nav("/account");
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed.");
    } finally {
      setBusy(false);
    }
  };
  if (!items.length)
    return <main className="container page">Your cart is empty.</main>;
  return (
    <main className="container page">
      <h1>Checkout</h1>
      <form className="auth-card checkout" onSubmit={submit}>
        {error && <p className="error">{error}</p>}
        {Object.keys(address).map((k) => (
          <label key={k}>
            {{ line1: "Address", postalCode: "Postal code" }[k] ||
              k.replace(/([A-Z])/g, " $1")}
            <input
              required
              value={address[k]}
              onChange={(e) => setAddress({ ...address, [k]: e.target.value })}
            />
          </label>
        ))}
        <p>
          Payment: Cash on delivery (online payment integration is not enabled
          yet).
        </p>
        <h3>Total: ₹{total.toLocaleString("en-IN")}</h3>
        <button className="btn btn-dark full" disabled={busy}>
          {busy ? "Placing order…" : "Place order"}
        </button>
      </form>
    </main>
  );
}
