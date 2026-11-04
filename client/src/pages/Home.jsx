import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Package,
} from "../components/Icons";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { API_URL, getErrorMessage } from "../config";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/products`, { params: { limit: 8, sort: "newest" } })
      .then(({ data }) => {
        if (active)
          setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch((err) => {
        if (active)
          setError(getErrorMessage(err, "We could not load the collection."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> THE EVERYDAY EDITION
          </p>
          <h1>
            Find your
            <br />
            <em>everyday</em> kind
            <br />
            of wonderful.
          </h1>
          <p className="hero-description">
            Useful little things. Considered details. Pieces that make the
            everyday feel a bit more special.
          </p>
          <Link className="button button-dark" to="/shop">
            Explore the collection <ArrowUpRight size={17} />
          </Link>
          <div className="hero-note">
            <Sparkles size={16} />
            <span>Thoughtfully selected, always.</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-sticker">
            GOOD
            <br />
            THINGS
            <br />
            <span>INSIDE</span> ✳
          </div>
          <div className="hero-product-shape">
            <div className="shape-sun" />
            <div className="shape-vase">
              <i />
            </div>
            <div className="shape-book book-one" />
            <div className="shape-book book-two" />
            <div className="shape-leaf leaf-one" />
            <div className="shape-leaf leaf-two" />
          </div>
          <span className="hero-caption">THE LITTLE THINGS MATTER</span>
        </div>
      </section>
      <section className="benefit-strip">
        <div>
          <Truck />
          <span>Carefully packed</span>
        </div>
        <div>
          <ShieldCheck />
          <span>Secure shopping</span>
        </div>
        <div>
          <Package />
          <span>Cash on delivery</span>
        </div>
      </section>
      <section className="section-shell collection-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A FEW GOOD FINDS</p>
            <h2>
              Meet the latest <em>lovelies.</em>
            </h2>
          </div>
          <Link to="/shop" className="text-link">
            Shop all products <ArrowRight size={17} />
          </Link>
        </div>
        {loading ? (
          <Loader label="Finding the good stuff..." />
        ) : error ? (
          <div className="notice error-notice">
            {error}{" "}
            <button
              className="text-link"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : products.length ? (
          <div className="product-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>✳</span>
            <h3>Something lovely is on its way.</h3>
            <p>
              There are no published products just yet. Please check back soon.
            </p>
          </div>
        )}
      </section>
      <section className="story-section" id="story">
        <div className="story-art">
          <div className="story-circle">
            A LITTLE
            <br />
            MORE <em>joy</em>
            <br />
            IN THE
            <br />
            EVERYDAY ✳
          </div>
        </div>
        <div className="story-copy">
          <p className="eyebrow">A NOTE FROM US</p>
          <h2>
            Less scrolling.
            <br />
            <em>More meaning.</em>
          </h2>
          <p>
            We believe the things we bring into our lives should earn their
            place. ShopSphere is a considered collection of everyday finds —
            picked for their usefulness, charm, and the small happiness they
            bring.
          </p>
          <Link className="text-link" to="/shop">
            Find your next favourite <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="closing-cta">
        <p className="eyebrow">YOUR NEXT GOOD FIND IS HERE</p>
        <h2>
          Make room for a little <em>wonder.</em>
        </h2>
        <Link to="/shop" className="button button-dark">
          Shop the collection <ArrowUpRight size={17} />
        </Link>
      </section>
    </main>
  );
}
