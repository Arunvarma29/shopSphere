import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
} from "../components/Icons";
import { currency } from "../config";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  if (!items.length)
    return (
      <main className="page-shell">
        <div className="empty-state cart-empty">
          <div className="empty-bag">
            <ShoppingBag size={30} />
          </div>
          <p className="eyebrow">YOUR SHOPPING BAG</p>
          <h1>
            A little room
            <br />
            <em>for something good.</em>
          </h1>
          <p>Your bag is taking a breather. Let's find it something lovely.</p>
          <Link to="/shop" className="button button-dark">
            Explore the shop <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  return (
    <main className="page-shell cart-page">
      <div className="page-intro compact-intro">
        <p className="eyebrow">YOUR SHOPPING BAG</p>
        <h1>
          The good <em>stuff.</em>
        </h1>
        <p>
          {items.length} different {items.length === 1 ? "find" : "finds"} in
          your bag.
        </p>
      </div>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item._id}>
              <Link
                to={`/products/${item.slug || item._id}`}
                className="cart-item-image"
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} />
                ) : (
                  <div className="image-placeholder">
                    <span>
                      shop<span>sphere</span>
                    </span>
                  </div>
                )}
              </Link>
              <div className="cart-item-info">
                <Link
                  to={`/products/${item.slug || item._id}`}
                  className="product-name"
                >
                  {item.name}
                </Link>
                <p>{currency(item.price)}</p>
                <div className="quantity-stepper small-stepper">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    aria-label="Decrease"
                  >
                    <Minus size={13} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    aria-label="Increase"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
              <div className="cart-item-end">
                <strong>{currency(item.price * item.quantity)}</strong>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item._id)}
                >
                  <Trash2 size={15} /> Remove
                </button>
              </div>
            </article>
          ))}
        </div>
        <aside className="order-summary">
          <p className="eyebrow">THE TOTAL SO FAR</p>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{currency(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>Free</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{currency(subtotal)}</strong>
          </div>
          <p className="summary-note">
            Shipping is on us. Pay when your order arrives.
          </p>
          <Link to="/checkout" className="button button-dark full-button">
            Continue to checkout <ArrowRight size={17} />
          </Link>
          <Link to="/shop" className="continue-link">
            Keep looking around
          </Link>
        </aside>
      </div>
    </main>
  );
}
