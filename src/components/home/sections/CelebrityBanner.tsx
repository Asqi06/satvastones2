import { motion } from 'motion/react';

export default function CelebrityBanner({ image, onClick, onNavigate }: any) {
  const handleClick = onClick || (() => onNavigate?.('shop'));

  if (!image) {
    return (
      <div className="bg-[#FAF7F2] px-4 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
          <button onClick={handleClick} className="flex h-[180px] w-full items-center justify-center rounded-[20px] bg-[#F2EBE1] md:h-[240px] lg:h-[300px] cursor-pointer hover:bg-[#E6D9C8] transition-colors">
            <span className="text-sm font-medium text-[#9C6A3B]">Celebrity Banner</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] px-4 pb-6">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <motion.div
          className="w-full overflow-hidden rounded-[20px] cursor-pointer"
          style={{ height: '180px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onClick={handleClick}
        >
          <img
            src={image}
            alt="Celebrity"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            loading="lazy"
          />
        </motion.div>
      </div>
    </div>
  );
}
