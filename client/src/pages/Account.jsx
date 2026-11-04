import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL, currency, getErrorMessage } from "../config";
import Loader from "../components/Loader";
import { Package, LogOut } from "../components/Icons";

export default function Account() {
  const { user, accessToken, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (user?.role === "admin") {
      setLoading(false);
      return;
    }
    let active = true;
    axios
      .get(`${API_URL}/orders/mine`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => {
        if (active) setOrders(Array.isArray(data.orders) ? data.orders : []);
      })
      .catch((err) => {
        if (active)
          setError(getErrorMessage(err, "Could not load your orders."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken, user?.role]);
  const signOut = async () => {
    await logout();
    navigate("/");
  };
  return (
    <main className="page-shell account-page">
      <div className="account-heading">
        <div>
          <p className="eyebrow">YOUR ACCOUNT</p>
          <h1>Your <em>profile.</em></h1>
          <p>Good to have you here, {user?.name}.</p>
        </div>
        <button className="button button-outline" onClick={signOut}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
      <section className="profile-card">
        <h2>Profile details</h2>
        <dl>
          <div>
            <dt>Name</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Account type</dt>
            <dd>{user?.role === "admin" ? "Administrator" : "Customer"}</dd>
          </div>
        </dl>
      </section>
      {location.state?.orderPlaced && (
        <div className="notice success-notice">
          Your order has been placed. Thank you for shopping with us!
        </div>
      )}
      {user?.role !== "admin" && (
        <section className="orders-panel">
          <div className="orders-panel-heading">
            <div>
              <p className="eyebrow">THE PAPER TRAIL</p>
              <h2>Your orders</h2>
            </div>
            <Package size={23} />
          </div>
          {loading ? (
            <Loader label="Finding your orders..." />
          ) : error ? (
            <div className="notice error-notice">{error}</div>
          ) : orders.length ? (
            <div className="orders-list">
              {orders.map((order) => (
                <article className="order-card" key={order._id}>
                  <div>
                    <span className="order-id">
                      ORDER #{order._id.slice(-7).toUpperCase()}
                    </span>
                    <strong>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>
                  </div>
                  <div>
                    <span className={`status-pill status-${order.status}`}>
                      {order.status}
                    </span>
                    <strong>{currency(order.total)}</strong>
                  </div>
                  <div className="order-products">
                    {order.items
                      ?.map((item) => `${item.name} × ${item.quantity}`)
                      .join(" · ")}
                  </div>
                  <small>Payment: Cash on delivery</small>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-orders">
              <span>✳</span>
              <h3>No orders just yet.</h3>
              <p>Your next favourite thing is waiting to be found.</p>
              <a href="/shop" className="text-link">
                Explore the shop →
              </a>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
