import { motion } from 'motion/react';

const defaultPersonas = [
  { id: '1', title: 'For Her', image: '' },
  { id: '2', title: 'For Him', image: '' },
  { id: '3', title: 'For Kids', image: '' },
];

export default function ShopByPersona({ items = [], onNavigate }: any) {
  const personas = items.length > 0 ? items : defaultPersonas;

  return (
    <div className="bg-[#FAF7F2] px-4 pb-6">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <h2 className="mb-4 text-[22px] font-bold text-[#3D2B24] md:text-2xl lg:text-3xl">Shop By Persona</h2>
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {personas.map((item: any) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate?.(`shop?persona=${item.title.toLowerCase().replace(/\s+/g, '-')}`)}
              className="relative aspect-[3/4] w-full overflow-hidden rounded-[18px] cursor-pointer"
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C6A3B]">
                    {item.title}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <span className="text-xs font-semibold text-white drop-shadow-md md:text-sm">
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
