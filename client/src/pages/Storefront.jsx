import { useEffect, useState } from "react";
import { http } from "../api/http";
import ProductCard from "../components/ProductCard";
export default function Storefront() {
  const [products, setProducts] = useState([]),
    [q, setQ] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      http
        .get("/products", {
          params: { q: q.trim() || undefined, limit: 24 },
          signal: controller.signal,
        })
        .then((r) => setProducts(r.data.products))
        .catch(() => {
          if (!controller.signal.aborted) {
            setProducts([]);
            setError("Products could not be loaded. Please try again.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, q.trim() ? 250 : 0);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [q]);
  return (
    <main className="container page">
      <section className="hero">
        <div>
          <p className="eyebrow">CURATED FOR EVERYDAY</p>
          <h1>
            Good finds.
            <br />
            <em>Better living.</em>
          </h1>
          <p>
            Discover useful things, thoughtfully selected for your everyday
            life.
          </p>
        </div>
        <div className="hero-art">
          S<span>.</span>
        </div>
      </section>
      <div className="section-head">
        <div>
          <p className="eyebrow">THE COLLECTION</p>
          <h2>Shop all products</h2>
        </div>
        <input
          className="search"
          type="search"
          aria-label="Search products"
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {error ? (
        <p role="alert">{error}</p>
      ) : loading ? (
        <p>Loading products…</p>
      ) : products.length ? (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <p>No products found. Try another search.</p>
      )}
    </main>
  );
}
