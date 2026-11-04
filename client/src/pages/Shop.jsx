import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { Search, SlidersHorizontal, X } from "../components/Icons";
import { API_URL, getErrorMessage } from "../config";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    axios
      .get(`${API_URL}/products`, {
        params: {
          q: search || undefined,
          category: category || undefined,
          sort,
          limit: 48,
        },
      })
      .then(({ data }) => {
        if (active) {
          const list = Array.isArray(data.products) ? data.products : [];
          setProducts(list);
          const unique = new Map();
          list.forEach((p) => {
            if (p.category?._id) unique.set(p.category._id, p.category);
          });
          setCategories([...unique.values()]);
        }
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, "Could not load products."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, category, sort]);
  const submit = (e) => {
    e.preventDefault();
    setSearch(query.trim());
  };
  return (
    <main className="page-shell shop-page">
      <div className="page-intro">
        <p className="eyebrow">THE SHOP</p>
        <h1>
          Good things, <em>right this way.</em>
        </h1>
        <p>Browse the little things that make a day.</p>
      </div>
      <div className="shop-toolbar">
        <form className="search-box" onSubmit={submit}>
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the collection..."
            aria-label="Search products"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSearch("");
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button type="submit">Search</button>
        </form>
        <div className="filter-controls">
          <label>
            <SlidersHorizontal size={16} />
            <span>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
      <div className="results-line">
        {loading
          ? "Finding products..."
          : `${products.length} ${products.length === 1 ? "find" : "finds"} to explore`}
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="notice error-notice">{error}</div>
      ) : products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>⌕</span>
          <h3>No matches this time.</h3>
          <p>Try another search or clear your filters.</p>
          <button
            className="button button-outline"
            onClick={() => {
              setQuery("");
              setSearch("");
              setCategory("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </main>
  );
}
