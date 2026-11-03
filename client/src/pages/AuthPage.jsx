import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await (isRegister ? register(form) : login(form));
      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to authenticate.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">SHOPSPHERE ACCOUNT</p>
        <h1>{isRegister ? "Create account" : "Welcome back"}</h1>
        {error && <p className="error">{error}</p>}
        {isRegister && (
          <label>
            Full name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            minLength="10"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button className="btn btn-dark full" disabled={busy}>
          {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>
        <p className="muted">
          {isRegister ? "Already registered?" : "New to ShopSphere?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </main>
  );
}
