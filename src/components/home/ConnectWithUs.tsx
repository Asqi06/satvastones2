import { Phone, MessageCircle, Mail } from "lucide-react";

export default function ConnectWithUs({ cmsData }: { cmsData?: any }) {
  const settings = cmsData?.settings || {};
  const phone = settings.connectPhone || '+91-90167-03180';
  const email = settings.connectEmail || 'support@satvastones.in';
  const tagline = settings.connectTagline || 'Loved by customers across India. We always try to bring the best experience to customers when shopping at Satvastones.';
  return (
    <section className="py-6 sm:py-8 lg:py-14 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-8">
        <p className="text-center text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#d4535f] mb-1 sm:mb-2">
          Available
        </p>
        <h2 className="font-heading text-lg sm:text-xl lg:text-3xl font-bold text-center text-gray-900 mb-4 sm:mb-6 lg:mb-10 italic">
          Connect with us
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-5 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 border border-gray-200 rounded-lg lg:rounded-xl hover:border-[#f2707f] transition-colors">
            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-[#f79da6] rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-[#d4535f]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[11px] sm:text-xs lg:text-sm">Call Us</h4>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500">Call now {phone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 border border-gray-200 rounded-lg lg:rounded-xl hover:border-[#f2707f] transition-colors">
            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-[#f79da6] rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-[#d4535f]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[11px] sm:text-xs lg:text-sm">Chat with Us</h4>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500">Chat now with an expert</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 border border-gray-200 rounded-lg lg:rounded-xl hover:border-[#f2707f] transition-colors">
            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-[#f79da6] rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-[#d4535f]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[11px] sm:text-xs lg:text-sm">Email Us</h4>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500">{email}</p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[10px] sm:text-xs lg:text-xs text-gray-500 mt-4 sm:mt-6 lg:mt-8">
          {tagline}
        </p>
      </div>
    </section>
  );
}
