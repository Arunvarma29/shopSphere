import { useEffect, useState } from "react";
import { http } from "../api/http";
import ProductCard from "../components/ProductCard";
export default function Storefront() {
  const [products, setProducts] = useState([]),
    [q, setQ] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    http
      .get("/products", { params: { q, limit: 24 } })
      .then((r) => setProducts(r.data.products))
      .finally(() => setLoading(false));
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
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {loading ? (
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
