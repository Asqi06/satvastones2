import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="bg-brown text-cream">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-site py-10 md:py-12 text-center">
          <h3 className="font-display text-xl md:text-2xl text-white mb-2">Join the SatvaStones Family</h3>
          <p className="text-sm text-cream/60 mb-5">Get 10% off your first order + exclusive updates on new launches</p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="max-w-md mx-auto flex gap-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder:text-cream/40 focus:outline-none focus:border-gold transition-colors"
            />
            <button type="submit" className="btn-gold whitespace-nowrap rounded-full px-6">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-site py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-display text-xl font-bold text-gold block mb-4">
              SatvaStones
            </Link>
            <p className="text-sm text-cream/60 leading-relaxed mb-6">
              India&apos;s favourite destination for Korean aesthetic jewellery — tarnish-free, waterproof, and crafted for the modern Indian woman.
            </p>
            <div className="flex gap-3">
              {['IG', 'FB', 'YT', 'PT'].map((s) => (
                <a key={s} href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-xs font-medium text-cream/60 hover:bg-gold hover:text-white transition-all">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gold-light mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-cream/60 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-sm text-cream/60 hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/blogs" className="text-sm text-cream/60 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-sm text-cream/60 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-gold-light mb-4">Categories</h4>
            <ul className="space-y-3">
              <li><Link to="/shop/earrings" className="text-sm text-cream/60 hover:text-white transition-colors">Earrings</Link></li>
              <li><Link to="/shop/necklaces" className="text-sm text-cream/60 hover:text-white transition-colors">Necklaces</Link></li>
              <li><Link to="/shop/rings" className="text-sm text-cream/60 hover:text-white transition-colors">Rings</Link></li>
              <li><Link to="/shop/bracelets" className="text-sm text-cream/60 hover:text-white transition-colors">Bracelets</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gold-light mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/account" className="text-sm text-cream/60 hover:text-white transition-colors">My Account</Link></li>
              <li><span className="text-sm text-cream/40">Track Order</span></li>
              <li><span className="text-sm text-cream/40">Shipping Info</span></li>
              <li><span className="text-sm text-cream/40">Returns Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-cream/40">
              &copy; {new Date().getFullYear()} SatvaStones. Made with <Heart className="w-3 h-3 inline text-rose" /> in India.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-cream/40 mr-1">We Accept:</span>
              {['Visa', 'MC', 'UPI', 'COD', 'Razorpay'].map((m) => (
                <span key={m} className="px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-medium text-cream/60">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
