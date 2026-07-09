import { Shield, Truck, RotateCcw, Award } from 'lucide-react';

const defaultItems = [
  { id: '1', icon: 'shield', label: 'Anti-Tarnish' },
  { id: '2', icon: 'truck', label: 'Free Shipping' },
  { id: '3', icon: 'rotate', label: 'Easy Returns' },
  { id: '4', icon: 'award', label: 'Premium Quality' },
];

const iconMap: Record<string, any> = {
  shield: Shield,
  truck: Truck,
  rotate: RotateCcw,
  award: Award,
};

export default function TrustStrip({ items = [] }: any) {
  const trustItems = items.length > 0 ? items : defaultItems;

  return (
    <div className="bg-[#FAF7F2] px-4 pb-6">
      <div className="mx-auto grid max-w-[390px] grid-cols-4 gap-2 md:max-w-[720px] md:gap-4 lg:max-w-[960px] lg:gap-6 xl:max-w-[1200px]">
        {trustItems.map((item: any) => {
          const Icon = iconMap[item.icon] || Shield;
          return (
            <div
              key={item.id}
              className="flex flex-col items-center justify-center rounded-[18px] bg-card px-1 py-3 shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
              style={{ height: '88px' }}
            >
              <Icon className="mb-1 h-10 w-10 text-[#9C6A3B]" strokeWidth={1.2} />
              <span className="text-center text-[11px] font-medium leading-tight text-[#3D2B24] md:text-sm">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
