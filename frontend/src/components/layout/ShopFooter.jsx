import { Link } from 'react-router-dom';

export default function ShopFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-12 text-sm text-neutral-600">
      <div className="container-app grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold text-neutral-900">
            Threaded<span className="text-amber-600">LK</span>
          </p>
          <p className="mt-2 leading-relaxed">
            Premium casual & oversized tees stitched for Sri Lankan weather — breathable cotton, honest fits, island-wide delivery.
          </p>
        </div>
        <div>
          <p className="font-semibold text-neutral-900">Shop</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link to="/products" className="hover:text-neutral-900 hover:underline">
                All products
              </Link>
            </li>
            <li>
              <Link to="/products?sort=newest" className="hover:text-neutral-900 hover:underline">
                New arrivals
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-neutral-900 hover:underline">
                Bag
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-neutral-900">Help</p>
          <ul className="mt-3 space-y-2">
            <li>
              <span className="hover:text-neutral-900">Sizing guide — chart on product pages</span>
            </li>
            <li>
              <span className="hover:text-neutral-900">Returns within 7 days (unworn)</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-neutral-900">Contact</p>
          <ul className="mt-3 space-y-2">
            <li>Colombo · Island-wide courier</li>
            <li>
              <a href="mailto:hello@threadedlk.example" className="hover:text-neutral-900 hover:underline">
                hello@threadedlk.example
              </a>
            </li>
            <li>
              <a href="tel:+94771234567" className="hover:text-neutral-900 hover:underline">
                +94 77 123 4567
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="container-app mt-10 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} ThreadedLK. Original storefront — not affiliated with any third-party retailer.
      </p>
    </footer>
  );
}
