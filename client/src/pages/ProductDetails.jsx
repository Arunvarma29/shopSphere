import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { http } from "../api/http";
import { useCart } from "../context/CartContext";
export default function ProductDetails() {
  const { slug } = useParams(),
    [product, setProduct] = useState(null),
    [error, setError] = useState("");
  const { add } = useCart();
  useEffect(() => {
    http
      .get(`/products/${slug}`)
      .then((r) => setProduct(r.data.product))
      .catch(() => setError("Product not found."));
  }, [slug]);
  if (error) return <main className="container page">{error}</main>;
  if (!product) return <main className="container page">Loading…</main>;
  return (
    <main className="container page detail">
      <img
        src={product.imageUrl || "https://placehold.co/800x700"}
        alt={product.name}
      />
      <div>
        <p className="eyebrow">{product.category?.name || "SHOPSPHERE"}</p>
        <h1>{product.name}</h1>
        <h2>₹{product.price.toLocaleString("en-IN")}</h2>
        <p>{product.description}</p>
        <p className="muted">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
        <button
          className="btn btn-dark"
          disabled={!product.stock}
          onClick={() => add(product)}
        >
          Add to cart
        </button>
      </div>
    </main>
  );
}
