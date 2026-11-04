import { useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
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
        <p className="auth-switch auth-forgot-link">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
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
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/account" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess(false);
    try {
      await register(form);
      setSuccess(true);
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
      {success ? (
        <div className="form-success" role="status">
          <p>
            We sent a verification link to <strong>{form.email}</strong>.
          </p>
          <p>
            Open the link to verify your email, then choose a password to finish
            creating your account.
          </p>
          <p className="auth-switch">
            Already verified? <Link to="/login">Sign in</Link>
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label>
            Your name
            <input
              required
              autoComplete="name"
              maxLength={80}
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
          {error && <p className="form-error">{error}</p>}
          <button className="button button-dark full-button" disabled={busy}>
            {busy ? "Sending link..." : "Send verification link"}
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="ACCOUNT RECOVERY"
      title={
        <>
          A fresh
          <br />
          <em>start.</em>
        </>
      }
      subtitle="Enter your account email and we’ll send a secure password reset link."
    >
      <form className="auth-form" onSubmit={submit}>
        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        {message && (
          <p className="form-success" role="status">
            {message}
          </p>
        )}
        <button className="button button-dark full-button" disabled={busy}>
          {busy ? "Sending link..." : "Send reset link"}
        </button>
        <p className="auth-switch">
          Remembered it? <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await resetPassword(token, password);
      setMessage(result.message);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="ACCOUNT RECOVERY"
      title={
        <>
          Choose a new
          <br />
          <em>password.</em>
        </>
      }
      subtitle="Use at least 10 characters for your new password."
    >
      {message ? (
        <div className="form-success" role="status">
          <p>{message}</p>
          <p className="auth-switch">
            <Link to="/login">Go to sign in</Link>
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={72}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 10 characters"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button
            className="button button-dark full-button"
            disabled={busy || !token}
          >
            {busy ? "Updating password..." : "Reset password"}
          </button>
          {!token && (
            <p className="form-error">
              This password reset link is invalid. Request a new one.
            </p>
          )}
        </form>
      )}
    </AuthLayout>
  );
}

export function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({
    message: "Verifying your email...",
    error: false,
    needsPassword: false,
  });
  const attemptedToken = useRef("");

  useEffect(() => {
    if (!token) {
      setStatus({
        message: "This verification link is missing or invalid.",
        error: true,
        needsPassword: false,
      });
      return;
    }
    if (attemptedToken.current === token) return;
    attemptedToken.current = token;

    verifyEmail(token)
      .then((result) =>
        setStatus({
          message: result.message,
          error: false,
          needsPassword: Boolean(result.needsPassword),
        }),
      )
      .catch((error) =>
        setStatus({
          message: getErrorMessage(error),
          error: true,
          needsPassword: false,
        }),
      );
  }, [token, verifyEmail]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus((current) => ({ ...current, error: false }));
    try {
      const result = await verifyEmail(token, password);
      setPassword("");
      setStatus({
        message: result.message,
        error: false,
        needsPassword: Boolean(result.needsPassword),
      });
    } catch (error) {
      setStatus((current) => ({
        ...current,
        message: getErrorMessage(error),
        error: true,
      }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="EMAIL VERIFICATION"
      title={
        <>
          Almost
          <br />
          <em>there.</em>
        </>
      }
      subtitle="Confirm your email and finish setting up your account."
    >
      {status.needsPassword ? (
        <form className="auth-form" onSubmit={submit}>
          <p
            className={status.error ? "form-error" : "form-success"}
            role="status"
          >
            {status.message}
          </p>
          <label>
            Choose a password
            <input
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={72}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 10 characters"
            />
            <small>Use at least 10 characters.</small>
          </label>
          <button className="button button-dark full-button" disabled={busy}>
            {busy ? "Creating account..." : "Verify and create account"}
          </button>
        </form>
      ) : (
        <div
          className={status.error ? "form-error" : "form-success"}
          role="status"
        >
          <p>{status.message}</p>
          {!status.error && (
            <p className="auth-switch">
              <Link to="/login">Continue to sign in</Link>
            </p>
          )}
          {status.error && (
            <p className="auth-switch">
              <Link to="/register">Create a new account</Link>
            </p>
          )}
        </div>
      )}
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
