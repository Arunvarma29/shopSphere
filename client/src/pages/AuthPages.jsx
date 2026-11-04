import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../config";
import { LockKeyhole, Sparkles } from "../components/Icons";

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user)
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/account"} replace />
    );
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const loggedIn = await login(form);
      navigate(
        location.state?.from ||
          (loggedIn.role === "admin" ? "/admin" : "/account"),
        { replace: true },
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title={
        <>
          Good to see
          <br />
          <em>you again.</em>
        </>
      }
      subtitle="Sign in to pick up where you left off."
    >
      <form className="auth-form" onSubmit={submit}>
        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Your password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button-dark full-button" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <p className="auth-switch">
          New around here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/account" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(form);
      navigate("/account", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout
      eyebrow="A GOOD PLACE TO START"
      title={
        <>
          Come on in.
          <br />
          <em>Stay a while.</em>
        </>
      }
      subtitle="Create an account and keep your good finds together."
    >
      <form className="auth-form" onSubmit={submit}>
        <label>
          Your name
          <input
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
          />
        </label>
        <label>
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 10 characters"
          />
          <small>Use at least 10 characters.</small>
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button-dark full-button" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <main className="auth-page">
      <div className="auth-art">
        <div className="auth-art-inner">
          <Sparkles size={22} />
          <p>
            GOOD THINGS
            <br />
            <em>start here.</em>
          </p>
          <span>SHOPSPHERE · THE EVERYDAY EDITION</span>
        </div>
      </div>
      <div className="auth-content">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          <p className="secure-note">
            <LockKeyhole size={14} /> Your account details are kept secure.
          </p>
        </div>
      </div>
    </main>
  );
}
