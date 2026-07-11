import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Contact Us</span>
      </div>

      {/* Header */}
      <div className="bg-[#f79da6] px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-white">Contact Us</h1>
        <p className="text-white/80 text-[10px] mt-1">We'd Love to Hear From You</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
            <div className="w-10 h-10 bg-[#f2707f] rounded-full flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-bold uppercase">Email Us</p>
              <p className="text-[10px] font-bold text-gray-800">support@satvastones.in</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
            <div className="w-10 h-10 bg-[#f2707f] rounded-full flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-bold uppercase">Call Us</p>
              <p className="text-[10px] font-bold text-gray-800">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
            <div className="w-10 h-10 bg-[#f2707f] rounded-full flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-bold uppercase">Our Studio</p>
              <p className="text-[10px] font-bold text-gray-800">Vapi, Gujarat, India</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Get In Touch</h2>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Have a question about your order or just want to say hi? Our team is here to help you find your perfect aesthetic vibe.
            </p>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Satvastones is India's premier destination for aesthetic Korean and Western jewelry. Based in Vapi, Gujarat, we curate anti-tarnish, waterproof pieces.
            </p>
            <div className="flex gap-2">
              <a href="https://www.instagram.com/satvastonesjewelry" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-pink-50 rounded-full flex items-center justify-center hover:bg-[#f2707f] hover:text-white transition-colors text-gray-600">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-pink-50 rounded-full flex items-center justify-center hover:bg-[#f2707f] hover:text-white transition-colors text-gray-600">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-pink-50 rounded-full flex items-center justify-center hover:bg-[#f2707f] hover:text-white transition-colors text-gray-600">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 rounded-xl p-5">
            {success ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-[#f2707f] rounded-full flex items-center justify-center mb-3">
                  <Send className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Message Sent!</h3>
                <p className="text-[10px] text-gray-500">Our team will reach out to you shortly.</p>
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleSubmit}>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your Name" required
                  className="w-full border border-gray-200 p-2.5 text-xs rounded-lg bg-white outline-none focus:border-[#f2707f]" />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email Address" required
                  className="w-full border border-gray-200 p-2.5 text-xs rounded-lg bg-white outline-none focus:border-[#f2707f]" />
                <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Subject"
                  className="w-full border border-gray-200 p-2.5 text-xs rounded-lg bg-white outline-none focus:border-[#f2707f]" />
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Your Message" rows={4} required
                  className="w-full border border-gray-200 p-2.5 text-xs rounded-lg bg-white outline-none focus:border-[#f2707f] resize-none" />
                <button disabled={isSubmitting}
                  className="w-full py-3 bg-[#f2707f] hover:bg-[#d4535f] text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2">
                  {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="mt-6 text-center">
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg text-xs font-bold uppercase hover:bg-green-600 transition-colors">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
