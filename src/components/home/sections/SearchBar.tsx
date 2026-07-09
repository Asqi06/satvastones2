import { Search } from 'lucide-react';

export default function SearchBar({ onSearch }: any) {
  return (
    <div className="bg-[#FAF7F2] px-4 pb-3 pt-2">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <button
          onClick={() => onSearch?.()}
          className="relative mx-auto flex h-[46px] w-full max-w-lg items-center rounded-[24px] border border-[#E8E0D6] bg-card px-4 md:max-w-xl lg:max-w-2xl cursor-pointer hover:border-[#9C6A3B] transition-colors"
        >
          <Search className="mr-3 h-4 w-4 shrink-0 text-[#B78453]" />
          <span className="w-full text-left text-sm text-[#CBB498]">Search jewellery...</span>
        </button>
      </div>
    </div>
  );
}
