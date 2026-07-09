import { motion } from 'motion/react';

const defaultStyles = [
  { id: '1', title: 'Minimalist', image: '' },
  { id: '2', title: 'Bohemian', image: '' },
  { id: '3', title: 'Classic', image: '' },
];

export default function ShopByStyle({ items = [], onNavigate }: any) {
  const styles = items.length > 0 ? items : defaultStyles;

  return (
    <div className="bg-[#FAF7F2] px-4 pb-6">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <h2 className="mb-4 text-[22px] font-bold text-[#3D2B24] md:text-2xl lg:text-3xl">Shop By Style</h2>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6">
          {styles.map((item: any) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate?.(`shop?style=${item.title.toLowerCase()}`)}
              className="relative h-40 w-[140px] shrink-0 overflow-hidden rounded-[18px] md:h-56 md:w-auto cursor-pointer text-left"
              whileTap={{ scale: 0.97 }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#F2EBE1]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9C6A3B]">
                    {item.title}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <span className="text-sm font-semibold text-white drop-shadow-md md:text-base">
                  {item.title}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
