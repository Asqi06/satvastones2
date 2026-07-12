import { useState } from 'react';
import { ChevronDown, Mail, Phone, Facebook, Instagram, Youtube } from 'lucide-react';

const accordionData = [
  {
    id: 'shop',
    title: 'Shop',
    links: ['Earrings', 'Necklaces', 'Rings', 'Bracelets', 'Gifts'],
  },
  {
    id: 'support',
    title: 'Support',
    links: ['Contact Us', 'Shipping', 'Returns', 'FAQ', 'Track Order'],
  },
  {
    id: 'about',
    title: 'About',
    links: ['Our Story', 'Blog', 'Careers', 'Press'],
  },
];

const paymentIcons = ['Visa', 'MC', 'UPI', 'COD', 'Razorpay'];

function AccordionItem({ title, links, defaultOpen, onNavigate }: any) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#E8E0D6]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold text-[#3D2B24]">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#9C6A3B] transition-transform duration-200 md:hidden ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`md:!grid-rows-[1fr] md:!pb-4 grid transition-all duration-200 ${
          open ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-2 pl-1 md:space-y-3">
            {links.map((link: string) => (
              <li key={link}>
                <button
                  onClick={() => onNavigate?.(`shop/${link.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="text-sm text-[#9C6A3B] hover:text-[#744D30] transition-colors md:text-base cursor-pointer"
                >
                  {link}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function FooterSection({ data, onNavigate }: any) {
  return (
    <footer className="bg-[#FAF7F2] px-4 pb-8 pt-2">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <div className="md:grid md:grid-cols-3 md:gap-8 lg:gap-12">
          <div className="mb-6 text-center md:text-left">
            <button onClick={() => onNavigate?.('home')} className="font-display text-2xl font-bold tracking-tight text-[#3D2B24] md:text-3xl cursor-pointer">
              Satva<span className="text-[#B78453]">Stones</span>
            </button>
            <p className="mt-2 text-xs text-[#9C6A3B] md:text-sm">
              Premium aesthetic jewelry for every occasion
            </p>

            <div className="mt-6 hidden space-y-3 md:block">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#9C6A3B]" />
                <span className="text-sm text-[#3D2B24]">support@satvastones.in</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#9C6A3B]" />
                <span className="text-sm text-[#3D2B24]">+91 90167 03180</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="hidden md:grid md:grid-cols-3 md:gap-8">
              {accordionData.map((col) => (
                <div key={col.id}>
                  <h3 className="mb-4 text-sm font-semibold text-[#3D2B24]">{col.title}</h3>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          onClick={() => onNavigate?.(`shop/${link.toLowerCase().replace(/\s+/g, '-')}`)}
                          className="text-sm text-[#9C6A3B] hover:text-[#744D30] transition-colors cursor-pointer"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mb-6 rounded-[18px] bg-card px-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] md:hidden">
              {accordionData.map((item, i) => (
                <AccordionItem key={item.id} {...item} defaultOpen={i === 0} onNavigate={onNavigate} />
              ))}
            </div>

            <div className="mb-6 space-y-3 rounded-[18px] bg-card px-4 py-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] md:hidden">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#9C6A3B]" />
                <span className="text-sm text-[#3D2B24]">support@satvastones.in</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#9C6A3B]" />
                <span className="text-sm text-[#3D2B24]">+91 90167 03180</span>
              </div>
            </div>

            <div className="mb-6 rounded-[18px] bg-card px-4 py-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <h3 className="mb-2 text-sm font-semibold text-[#3D2B24]">Stay in touch</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 rounded-[20px] border border-[#E8E0D6] bg-[#FAF7F2] px-4 py-2 text-sm text-[#3D2B24] outline-none placeholder:text-[#CBB498]"
                />
                <button className="rounded-[20px] bg-[#9C6A3B] px-4 py-2 text-sm font-semibold text-card transition-transform hover:scale-105 cursor-pointer">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex gap-4">
            <div className="rounded-full bg-card p-2.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <Facebook className="h-5 w-5 text-[#3D2B24]" />
            </div>
            <div className="rounded-full bg-card p-2.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <Instagram className="h-5 w-5 text-[#3D2B24]" />
            </div>
            <div className="rounded-full bg-card p-2.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <Youtube className="h-5 w-5 text-[#3D2B24]" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {paymentIcons.map((m) => (
              <span
                key={m}
                className="rounded-full bg-card px-3 py-1 text-[10px] font-medium text-[#9C6A3B] shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-[#CBB498]">
          &copy; {new Date().getFullYear()} SatvaStones. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
