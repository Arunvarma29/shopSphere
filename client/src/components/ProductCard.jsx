import { Link } from "react-router-dom";
import { ShoppingBag } from "./Icons";
import { currency } from "../config";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  return (
    <article className="product-card">
      <Link
        to={`/products/${product.slug || product._id}`}
        className="product-image-wrap"
      >
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="image-placeholder">
            <span>
              shop<span>sphere</span>
            </span>
          </div>
        )}
        {product.stock <= 0 && <span className="product-label">Sold out</span>}
      </Link>
      <div className="product-card-info">
        <div>
          <p className="product-category">
            {product.category?.name || "Everyday essentials"}
          </p>
          <Link
            to={`/products/${product.slug || product._id}`}
            className="product-name"
          >
            {product.name}
          </Link>
          <div className="product-price">
            {currency(product.price)}{" "}
            {product.compareAtPrice > product.price && (
              <del>{currency(product.compareAtPrice)}</del>
            )}
          </div>
        </div>
        <button
          className="quick-add"
          disabled={product.stock <= 0}
          onClick={() => addItem(product)}
          aria-label={`Add ${product.name} to bag`}
        >
          <ShoppingBag size={17} />
        </button>
      </div>
    </article>
  );
}
