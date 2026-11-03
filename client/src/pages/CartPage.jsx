import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
export default function CartPage() {
  const { items, change, remove, total } = useCart(),
    nav = useNavigate();
  return (
    <main className="container page">
      <p className="eyebrow">YOUR BAG</p>
      <h1>Shopping cart</h1>
      {!items.length ? (
        <p>
          Your cart is empty. <Link to="/">Explore products</Link>
        </p>
      ) : (
        <div className="cart-layout">
          <div>
            {items.map((p) => (
              <div className="cart-row" key={p._id}>
                <img src={p.imageUrl || "https://placehold.co/100"} alt="" />
                <div className="grow">
                  <strong>{p.name}</strong>
                  <p>₹{p.price.toLocaleString("en-IN")}</p>
                  <button className="text-button" onClick={() => remove(p._id)}>
                    Remove
                  </button>
                </div>
                <input
                  aria-label="Quantity"
                  type="number"
                  min="1"
                  max={p.stock}
                  value={p.quantity}
                  onChange={(e) => change(p._id, e.target.value)}
                />
              </div>
            ))}
          </div>
          <aside className="summary">
            <h2>Order summary</h2>
            <p>
              Subtotal <strong>₹{total.toLocaleString("en-IN")}</strong>
            </p>
            <p>
              Shipping <strong>Free</strong>
            </p>
            <hr />
            <h3>
              Total <strong>₹{total.toLocaleString("en-IN")}</strong>
            </h3>
            <button
              className="btn btn-dark full"
              onClick={() => nav("/checkout")}
            >
              Continue to checkout
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
