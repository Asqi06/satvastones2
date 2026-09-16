"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface Tab {
  id: string;
  title: string;
  content: string;
}

export default function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="mt-10">
      {tabs.map((tab) => (
        <div key={tab.id} className="border-b border-[var(--line)] first:border-t">
          <button
            onClick={() => setActiveTab(activeTab === tab.id ? "" : tab.id)}
            aria-expanded={activeTab === tab.id}
            className="w-full py-5 flex justify-between items-center text-left gap-5"
          >
            <span className="text-[13px] font-medium text-[var(--ink)]">
              {tab.title}
            </span>
            <Plus
              className={`w-4 h-4 text-[var(--ink)] transition-transform duration-300 flex-shrink-0 ${
                activeTab === tab.id ? "rotate-45" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              activeTab === tab.id
                ? "max-h-48 pb-6 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-[var(--muted)] text-sm leading-relaxed whitespace-pre-line">
              {tab.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
