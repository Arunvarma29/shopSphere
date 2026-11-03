import { useEffect, useState } from "react";
import { http } from "../api/http";
export default function AccountPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    http.get("/orders/mine").then((r) => setOrders(r.data.orders));
  }, []);
  return (
    <main className="container page">
      <p className="eyebrow">YOUR ACCOUNT</p>
      <h1>Order history</h1>
      {orders.length ? (
        orders.map((o) => (
          <article className="order-card" key={o._id}>
            <div>
              <strong>Order #{o._id.slice(-7).toUpperCase()}</strong>
              <p className="muted">
                {new Date(o.createdAt).toLocaleDateString()} · {o.items.length}{" "}
                items
              </p>
            </div>
            <strong>₹{o.total.toLocaleString("en-IN")}</strong>
            <span className="status">{o.status}</span>
          </article>
        ))
      ) : (
        <p>You haven't placed any orders yet.</p>
      )}
    </main>
  );
}
