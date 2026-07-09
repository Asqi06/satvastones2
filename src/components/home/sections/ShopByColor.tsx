import { motion } from 'motion/react';

const defaultColors = [
  { id: '1', title: 'Gold', image: '', color: '#D4AF37' },
  { id: '2', title: 'Rose Gold', image: '', color: '#B76E79' },
  { id: '3', title: 'Silver', image: '', color: '#C0C0C0' },
];

function ColorCircle({ color, title }: { color: string; title: string }) {
  return (
    <div
      className="flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-inner md:h-[80px] md:w-[80px]"
      style={{ backgroundColor: color }}
    >
      <span className="text-[8px] font-bold uppercase tracking-wider text-white drop-shadow-md md:text-[10px]">
        {title}
      </span>
    </div>
  );
}

export default function ShopByColor({ items = [], onNavigate }: any) {
  const colors = items.length > 0 ? items : defaultColors;

  return (
    <div className="bg-[#FAF7F2] px-4 pb-6">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <h2 className="mb-4 text-[22px] font-bold text-[#3D2B24] md:text-2xl lg:text-3xl">Shop By Color</h2>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:gap-6">
          {colors.map((item: any) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate?.(`shop?color=${item.title.toLowerCase()}`)}
              className="flex w-[120px] shrink-0 flex-col items-center gap-3 md:w-auto cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              <div className="h-[60px] w-[60px] overflow-hidden rounded-full bg-[#F2EBE1] md:h-[80px] md:w-[80px]">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <ColorCircle color={item.color} title={item.title} />
                )}
              </div>
              <span className="text-center text-[12px] font-medium text-[#3D2B24] md:text-sm">
                {item.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
