import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Send } from 'lucide-react';

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
      {/* Hero */}
      <div className="bg-stone-50 py-16 md:py-24 text-center px-4">
        <h1 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tight text-stone-900">
          Get In <span className="text-stone-400">Touch</span>
        </h1>
        <p className="mt-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-stone-500">
          We'd Love to Hear From Our Aesthetic Community
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-stone-900">Connect With Us</h2>
              <p className="text-stone-500 text-xs uppercase tracking-widest leading-loose max-w-md">
                Have a question about your order or just want to say hi? Our team is here to help you find your perfect aesthetic vibe.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-stone-900" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Email Us</p>
                  <p className="text-xs font-bold uppercase text-stone-900">hello@satvastones.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-stone-900" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Call Us</p>
                  <p className="text-xs font-bold uppercase text-stone-900">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-stone-900" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Our Studio</p>
                  <p className="text-xs font-bold uppercase text-stone-900">Aesthetic Lane, Jaipur, India</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-stone-100 flex gap-6">
               {[Instagram, Facebook, Twitter].map((Icon, i) => (
                 <button key={i} className="w-10 h-10 border border-stone-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
                   <Icon className="h-4 w-4" />
                 </button>
               ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-stone-50 p-8 md:p-12">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="font-display text-3xl font-bold uppercase tracking-tight">Message Sent</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Our team will reach out to you shortly.</p>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border-b border-stone-200 bg-transparent py-3 text-sm focus:border-black outline-hidden" 
                    placeholder="NAME" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border-b border-stone-200 bg-transparent py-3 text-sm focus:border-black outline-hidden" 
                    placeholder="EMAIL" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full border-b border-stone-200 bg-transparent py-3 text-sm focus:border-black outline-hidden" 
                  placeholder="SUBJECT" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Message</label>
                  <textarea 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full border-b border-stone-200 bg-transparent py-3 text-sm focus:border-black outline-hidden resize-none" 
                    placeholder="HOW CAN WE HELP?" 
                    required
                  ></textarea>
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-xl disabled:bg-stone-400"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="h-4 w-4" />
                </button>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
