import { motion } from 'motion/react';

export default function HeroBanner({ image, title, subtitle, cta, onCtaClick, onClick, onNavigate }: any) {
  const handleClick = onCtaClick || (() => onNavigate?.('shop'));

  if (!image) {
    return (
      <div className="bg-[#FAF7F2] px-4 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
          <button onClick={handleClick} className="flex aspect-[16/9] w-full items-center justify-center rounded-[20px] bg-[#F2EBE1] lg:aspect-[21/9] cursor-pointer hover:bg-[#E6D9C8] transition-colors">
            <span className="text-sm font-medium text-[#9C6A3B]">Hero Banner</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] px-4 pb-6">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <motion.div
          className="relative w-full overflow-hidden rounded-[20px] cursor-pointer"
          style={{ aspectRatio: '16/9' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onClick={handleClick}
        >
          <img
            src={image}
            alt={title || 'Promotional banner'}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            loading="lazy"
          />
          {(title || subtitle) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 p-6 text-center">
              {title && (
                <h2 className="mb-2 text-2xl font-bold text-white drop-shadow-md md:text-4xl lg:text-5xl">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mb-4 text-sm text-white/90 drop-shadow-md md:text-lg">{subtitle}</p>
              )}
              {cta && (
                <span className="inline-block rounded-[20px] bg-card px-6 py-2 text-sm font-semibold text-[#3D2B24] shadow-md transition-transform hover:scale-105 md:px-8 md:py-3 md:text-base">
                  {cta}
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
