import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
export default function ProductCard({ product }) {
  const { add } = useCart();
  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`}>
        <img
          src={product.imageUrl || "https://placehold.co/600x500?text=Product"}
          alt={product.name}
        />
      </Link>
      <div className="product-meta">
        <div>
          <Link to={`/products/${product.slug}`}>
            <h3>{product.name}</h3>
          </Link>
          <p className="muted">{product.category?.name || "Featured"}</p>
        </div>
        <strong>₹{product.price.toLocaleString("en-IN")}</strong>
      </div>
      <button className="btn btn-dark full" onClick={() => add(product)}>
        Add to cart
      </button>
    </article>
  );
}
