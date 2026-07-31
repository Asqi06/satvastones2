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
    <div className="mt-12 border-t border-[var(--luxury-border)]">
      {tabs.map((tab) => (
        <div key={tab.id} className="border-b border-[var(--luxury-border)]">
          <button
            onClick={() => setActiveTab(activeTab === tab.id ? "" : tab.id)}
            className="w-full py-6 flex justify-between items-center text-left"
          >
            <h4 className="label-md font-bold text-[var(--luxury-brown)]">
              {tab.title}
            </h4>
            <Plus
              className={`w-4 h-4 text-[var(--luxury-brown)] transition-transform duration-300 ${
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
            <p className="text-[var(--luxury-brown)]/70 text-[0.9rem] leading-relaxed whitespace-pre-line">
              {tab.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
