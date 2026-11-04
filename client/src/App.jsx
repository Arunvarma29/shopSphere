import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import {
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
} from "./pages/AuthPages";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function NotFound() {
  return (
    <main className="page-shell">
      <div className="empty-state">
        <p className="eyebrow">404 · NOT QUITE THERE</p>
        <h1>
          Looks like this
          <br />
          <em>page wandered off.</em>
        </h1>
        <p>Let's get you back to the good stuff.</p>
        <a className="button button-dark" href="/">
          Back to home
        </a>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          }
          path="/"
        />
        <Route
          element={
            <>
              <Header />
              <Shop />
              <Footer />
            </>
          }
          path="/shop"
        />
        <Route
          element={
            <>
              <Header />
              <ProductDetails />
              <Footer />
            </>
          }
          path="/products/:slug"
        />
        <Route
          element={
            <>
              <Header />
              <Cart />
              <Footer />
            </>
          }
          path="/cart"
        />
        <Route
          element={
            <>
              <Header />
              <Login />
              <Footer />
            </>
          }
          path="/login"
        />
        <Route
          element={
            <>
              <Header />
              <Register />
              <Footer />
            </>
          }
          path="/register"
        />
        <Route
          element={
            <>
              <Header />
              <ForgotPassword />
              <Footer />
            </>
          }
          path="/forgot-password"
        />
        <Route
          element={
            <>
              <Header />
              <ResetPassword />
              <Footer />
            </>
          }
          path="/reset-password"
        />
        <Route
          element={
            <>
              <Header />
              <VerifyEmail />
              <Footer />
            </>
          }
          path="/verify-email"
        />
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <>
                <Header />
                <Checkout />
                <Footer />
              </>
            }
            path="/checkout"
          />
          <Route
            element={
              <>
                <Header />
                <Account />
                <Footer />
              </>
            }
            path="/account"
          />
        </Route>
        <Route element={<ProtectedRoute admin />}>
          <Route element={<Admin />} path="/admin" />
        </Route>
        <Route
          element={
            <>
              <Header />
              <NotFound />
              <Footer />
            </>
          }
          path="*"
        />
      </Routes>
    </>
  );
}
