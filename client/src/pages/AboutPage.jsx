import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <main className="container page about-page">
      <section className="about-hero">
        <p className="eyebrow">ABOUT SHOPSPHERE</p>
        <h1>
          Thoughtful finds
          <br />
          <em>for everyday life.</em>
        </h1>
        <p>
          We believe the things you use every day should feel useful, considered,
          and a little more special.
        </p>
      </section>

      <section className="about-story">
        <div className="about-mark" aria-hidden="true">
          S<span>.</span>
        </div>
        <div>
          <p className="eyebrow">OUR APPROACH</p>
          <h2>Less noise. Better finds.</h2>
          <p>
            ShopSphere is a place to discover pieces for everyday living. We
            keep the experience simple so you can spend less time searching and
            more time enjoying what you find.
          </p>
          <p>
            From browsing the collection to placing an order, we want every step
            to feel clear, convenient, and welcoming.
          </p>
          <Link className="btn btn-dark" to="/">
            Explore the collection
          </Link>
        </div>
      </section>
    </main>
  );
}
