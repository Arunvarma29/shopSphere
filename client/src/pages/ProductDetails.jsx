import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "../components/Icons";
import Loader from "../components/Loader";
import { API_URL, currency, getErrorMessage } from "../config";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    axios
      .get(`${API_URL}/products/${encodeURIComponent(slug)}`)
      .then(({ data }) => {
        if (active) setProduct(data.product);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, "Product not found."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);
  if (loading) return <Loader label="Opening product..." />;
  if (error || !product)
    return (
      <main className="page-shell">
        <div className="empty-state">
          <h2>We couldn't find that one.</h2>
          <p>{error}</p>
          <Link className="button button-dark" to="/shop">
            Back to the shop
          </Link>
        </div>
      </main>
    );
  return (
    <main className="page-shell detail-page">
      <Link className="back-link" to="/shop">
        <ArrowLeft size={16} /> Back to the shop
      </Link>
      <div className="detail-layout">
        <div className="detail-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="image-placeholder large">
              <span>
                shop<span>sphere</span>
              </span>
            </div>
          )}
        </div>
        <div className="detail-info">
          <p className="eyebrow">
            {product.category?.name || "A SHOPSPHERE FIND"}
          </p>
          <h1>{product.name}</h1>
          <div className="detail-price">
            {currency(product.price)}{" "}
            {product.compareAtPrice > product.price && (
              <del>{currency(product.compareAtPrice)}</del>
            )}
          </div>
          <p className="detail-description">{product.description}</p>
          <p className={`stock-note ${product.stock > 0 ? "" : "out"}`}>
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Currently unavailable"}
          </p>
          <div className="purchase-row">
            <div className="quantity-stepper">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock || 1, q + 1))
                }
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              className="button button-dark add-cart-button"
              disabled={product.stock <= 0}
              onClick={() => {
                addItem(product, quantity);
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
            >
              {added ? "Added to your bag ✓" : "Add to bag"}
            </button>
          </div>
          <div className="detail-perks">
            <div>
              <Truck size={18} />
              <span>Carefully packed for you</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>Cash on delivery available</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
