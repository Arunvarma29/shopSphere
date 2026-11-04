import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import ProtectedRoute from "./routes/ProtectedRoute";
import Storefront from "./pages/Storefront";
import AuthPage from "./pages/AuthPage";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-shell">
            <Header />
            <div className="app-content">
              <Routes>
                <Route path="/" element={<Storefront />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage mode="register" />} />
                <Route path="/products/:slug" element={<ProductDetails />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/account" element={<AccountPage />} />
                </Route>
                <Route element={<ProtectedRoute admin />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
                <Route
                  path="*"
                  element={
                    <main className="container page">
                      <h1>Page not found</h1>
                    </main>
                  }
                />
              </Routes>
            </div>
            <footer className="footer">
              <div className="container footer-content">
                <div className="footer-about">
                  <Link className="brand footer-brand" to="/">
                    shop<span>sphere.</span>
                  </Link>
                  <p>Thoughtful finds for everyday life.</p>
                </div>
                <nav className="footer-links" aria-label="Footer navigation">
                  <Link to="/">Shop</Link>
                  <Link to="/cart">Shopping cart</Link>
                  <Link to="/about">About us</Link>
                </nav>
                <p className="footer-copyright">
                  © {new Date().getFullYear()} ShopSphere. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
