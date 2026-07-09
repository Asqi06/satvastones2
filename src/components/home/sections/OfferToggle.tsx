import { useState } from 'react';

const offers = [
  { id: 'new', label: "What's New" },
  { id: 'sale', label: 'Sale' },
];

export default function OfferToggle({ onToggle }: any) {
  const [active, setActive] = useState('new');

  const handleToggle = (id: string) => {
    setActive(id);
    onToggle?.(id);
  };

  return (
    <div className="bg-[#FAF7F2] px-4 pb-4">
      <div className="mx-auto flex max-w-[390px] justify-center gap-2 md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        {offers.map((offer) => (
          <button
            key={offer.id}
            onClick={() => handleToggle(offer.id)}
            className={`h-9 w-[160px] rounded-[20px] text-sm font-semibold transition-all duration-200 ${
              active === offer.id
                ? 'bg-gradient-to-r from-[#9C6A3B] to-[#744D30] bg-card shadow-sm'
                : 'border border-[#9C6A3B] bg-card text-[#9C6A3B]'
            }`}
          >
            {offer.label}
          </button>
        ))}
      </div>
    </div>
  );
}
