import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link to="/" className="brand footer-brand">
            shop<span>sphere</span>
            <i>.</i>
          </Link>
          <p>
            Thoughtful finds for everyday life.
            <br />
            Good things, chosen with care.
          </p>
        </div>
        <div>
          <strong>Explore</strong>
          <Link to="/shop">Shop all</Link>
          <a href="/#story">Our story</a>
          <Link to="/account">My account</Link>
        </div>
        <div>
          <strong>Need a hand?</strong>
          <a href="mailto:hello@shopsphere.example">Get in touch</a>
          <Link to="/account">Your orders</Link>
          <Link to="/cart">Shopping bag</Link>
        </div>
        <div className="newsletter" id="newsletter">
          <strong>A good note, now and then.</strong>
          <p>New finds and little updates. No noise.</p>
          <a href="mailto:hello@shopsphere.example">
            Say hello <span>↗</span>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ShopSphere. Made for everyday.</span>
        <span>Thoughtfully selected · Secure checkout · Cash on delivery</span>
      </div>
    </footer>
  );
}
