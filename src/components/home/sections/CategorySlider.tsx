import { motion } from 'motion/react';

const fallbackCategories = [
  { id: '1', title: 'Earrings', image: '' },
  { id: '2', title: 'Necklaces', image: '' },
  { id: '3', title: 'Rings', image: '' },
  { id: '4', title: 'Bracelets', image: '' },
  { id: '5', title: 'Pendants', image: '' },
  { id: '6', title: 'Gifts', image: '' },
];

function PlaceholderCircle({ title }: { title: string }) {
  return (
    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#F2EBE1] text-[10px] font-bold uppercase tracking-wider text-[#9C6A3B] md:h-[80px] md:w-[80px]">
      {title.slice(0, 3)}
    </div>
  );
}

export default function CategorySlider({ categories = [], onNavigate }: any) {
  const items = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="bg-[#FAF7F2] px-4 pb-4">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4 lg:grid-cols-6 lg:gap-6">
          {items.map((cat: any) => (
            <motion.button
              key={cat.id}
              onClick={() => onNavigate?.(`shop/${cat.title?.toLowerCase() || cat.slug || cat.id}`)}
              className="flex w-[72px] shrink-0 flex-col items-center gap-2 md:w-auto cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              <div className="h-[60px] w-[60px] overflow-hidden rounded-full bg-[#F2EBE1] md:h-[80px] md:w-[80px]">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <PlaceholderCircle title={cat.title} />
                )}
              </div>
              <span className="text-center text-[12px] font-medium text-[#3D2B24] md:text-sm">
                {cat.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
