import React from "react";
import { AutoSizer } from "react-virtualized-auto-sizer";
import * as ReactWindow from "react-window";

// @ts-ignore
const VariableSizeList = (ReactWindow.VariableSizeList || ReactWindow.default?.VariableSizeList || ReactWindow) as any;
// @ts-ignore
const AutoSizerAny = (AutoSizer || (AutoSizer as any).default) as any;

export function meta({}: any) {
  return [
    { title: "Terms of Service - TaskHub" },
    { name: "description", content: "Terms of Service for TaskHub" },
  ];
}

const TERMS_CONTENT = [
  { type: "header", text: "Terms of Service" },
  { type: "date", text: "Effective Date: January 1, 2026" },
  { type: "section", title: "1. Acceptance of Terms", text: "By accessing or using the TaskHub service, website, or any applications (including mobile applications) made available by TaskHub (together, the 'Service'), however accessed, you agree to be bound by these terms of use ('Terms of Use'). The Service is owned or controlled by TaskHub. These Terms of Use affect your legal rights and obligations. If you do not agree to be bound by all of these Terms of Use, do not access or use the Service." },
  { type: "section", title: "2. Basic Terms", text: "You may not post violent, nude, partially nude, discriminatory, unlawful, infringing, hateful, pornographic or sexually suggestive photos or other content via the Service." },
  { type: "list", items: ["You are responsible for any activity that occurs through your account.", "You agree you will not sell, transfer, license or assign your account.", "You are solely responsible for your conduct and any data, text, files, information, usernames, images, graphics, photos, profiles, audio and video clips, sounds, musical works, works of authorship, applications, links and other content or materials."] },
  { type: "section", title: "3. General Conditions", text: "We reserve the right to modify or terminate the Service or your access to the Service for any reason, without notice, at any time, and without liability to you." },
  // ... repeated content to simulate length for virtual scrolling demonstration
  ...Array.from({ length: 100 }, (_, i) => ({
    type: "section",
    title: `${4 + i}. Clause ${i + 1}`,
    text: "Review carefully. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  })),
  { type: "footer", text: "End of Terms" }
];

const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const item = TERMS_CONTENT[index];
  
  return (
    <div style={style} className="px-2">
      {item.type === "header" && (
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 text-glass-heading pt-8">
          {item.text}
        </h1>
      )}
      {item.type === "date" && (
        <p className="text-gray-400 mb-8 font-mono">{item.text}</p>
      )}
      {item.type === "section" && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{item.title}</h2>
          <p className="text-glass-secondary leading-relaxed">{item.text}</p>
        </div>
      )}
      {item.type === "list" && (
        <ul className="list-disc pl-6 space-y-2 mb-6 text-glass-secondary">
          {item.items?.map((li, idx) => (
            <li key={idx} className="pl-2">{li}</li>
          ))}
        </ul>
      )}
       {item.type === "footer" && (
        <div className="py-12 border-t border-white/10 mt-8 text-center text-gray-500 text-sm uppercase tracking-widest">
            {item.text}
        </div>
      )}
    </div>
  );
};

export default function TermsPage() {
  const getItemSize = (index: number) => {
     // A crude estimation for demo purposes.
     const item = TERMS_CONTENT[index];
     switch (item.type) {
         case 'header': return 120;
         case 'date': return 60;
         case 'section': return 180;
         case 'list': return 100 + ((item.items?.length || 0) * 30);
         case 'footer': return 100;
         default: return 100;
     }
  };

  return (
    <div className="h-[calc(100vh-200px)] w-full max-w-4xl mx-auto backdrop-blur-3xl bg-black/85 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
       <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10"></div>
       <AutoSizerAny>
        {({ height, width }: { height: number; width: number }) => (
          <VariableSizeList
            height={height}
            width={width}
            itemCount={TERMS_CONTENT.length}
            itemSize={getItemSize}
            className="scrollbar-none"
          >
            {Row}
          </VariableSizeList>
        )}
      </AutoSizerAny>
    </div>
  );
}
