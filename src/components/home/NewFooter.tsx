"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";

export default function NewFooter() {
  return (
    <footer className="bg-[#f79da6] pt-6 sm:pt-8 lg:pt-14 pb-4 sm:pb-5 lg:pb-6">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10 mb-6 sm:mb-8 lg:mb-10">
          {/* About */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-[11px] sm:text-xs lg:text-sm">About Satvastones</h4>
            <p className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 leading-relaxed">
              Satvastones is your go-to for all things accessories. From everyday basics to statement pieces, we bring you trendy, affordable styles that flex with every outfit and every plan.
            </p>
            <div className="flex gap-2 sm:gap-2.5 mt-2.5 sm:mt-3">
              <a href="https://www.instagram.com/satvastonesjewelry" target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
              </a>
              <a href="#" className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
              </a>
              <a href="#" className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-[11px] sm:text-xs lg:text-sm">Quick Links</h4>
            <ul className="space-y-1 sm:space-y-1.5">
              <li><a href="/shop" className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 hover:text-[#d4535f] transition-colors">Search</a></li>
              <li><a href="/about" className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 hover:text-[#d4535f] transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 hover:text-[#d4535f] transition-colors">Contact</a></li>
              <li><a href="/shop" className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 hover:text-[#d4535f] transition-colors">Returns / Exchange</a></li>
            </ul>
          </div>
          
          {/* Store Policy */}
          <div>
            <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-[11px] sm:text-xs lg:text-sm">Store Policy</h4>
            <ul className="space-y-1 sm:space-y-1.5">
              <li><a href="/terms" className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 hover:text-[#d4535f] transition-colors">Terms Of Service</a></li>
              <li><a href="/shipping" className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 hover:text-[#d4535f] transition-colors">Shipping Policy</a></li>
              <li><a href="/returns" className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 hover:text-[#d4535f] transition-colors">Refund Policy</a></li>
              <li><a href="/privacy" className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 hover:text-[#d4535f] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-[11px] sm:text-xs lg:text-sm">Sign Up to Newsletter</h4>
            <p className="text-[10px] sm:text-[11px] lg:text-xs text-gray-600 mb-2 sm:mb-3">
              Enter your email address to get latest updates on sales and offers.
            </p>
            <div className="flex gap-1.5 sm:gap-2">
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4535f]"
              />
              <button className="bg-[#f2707f] hover:bg-[#d4535f] text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[#f2707f]/30 pt-3 sm:pt-4 text-center">
          <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-500 uppercase tracking-wider">
            &copy; 2026 Satvastones. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
