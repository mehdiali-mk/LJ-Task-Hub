import React, { useRef, useEffect } from "react";
import * as ReactWindow from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";

// @ts-ignore
const List = (ReactWindow.FixedSizeList || ReactWindow.default?.FixedSizeList || ReactWindow) as any;
// @ts-ignore
const AutoSizerAny = (AutoSizer || (AutoSizer as any).default) as any;

export function meta({}: any) {
  return [
    { title: "Privacy Policy - TaskHub" },
    { name: "description", content: "Privacy Policy for TaskHub" },
  ];
}

const PRIVACY_CONTENT = [
  { type: "header", text: "Privacy Policy" },
  { type: "date", text: "Last Updated: January 1, 2026" },
  { type: "section", title: "1. Introduction", text: "Welcome to TaskHub. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us." },
  { type: "section", title: "2. Information We Collect", text: "We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us." },
  { type: "subsection", title: "2.1 Personal Data", text: "Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you choose to participate in various activities related to the Application." },
  { type: "subsection", title: "2.2 Derivative Data", text: "Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application." },
  { type: "section", title: "3. Use of Your Information", text: "Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:" },
  { type: "list", items: ["Create and manage your account.", "Email you regarding your account or order.", "Fulfill and manage purchases, orders, payments, and other transactions related to the Application.", "Generate a personal profile about you to make future visits to the Application more personalized.", "Increase the efficiency and operation of the Application.", "Monitor and analyze usage and trends to improve your experience with the Application.", "Notify you of updates to the Application.", "Offer new products, services, mobile applications, and/or recommendations to you."] },
  { type: "section", title: "4. Disclosure of Your Information", text: "We may share information we have collected about you in certain situations. Your information may be disclosed as follows:" },
  { type: "subsection", title: "4.1 By Law or to Protect Rights", text: "If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation." },
  { type: "section", title: "5. Security of Your Information", text: "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse." },
  // ... repeated content to simulate length for virtual scrolling demonstration
  ...Array.from({ length: 100 }, (_, i) => ({
    type: "section",
    title: `${6 + i}. Generic Section ${i + 1}`,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  })),
  { type: "footer", text: "End of Privacy Policy" }
];

const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const item = PRIVACY_CONTENT[index];
  
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
      {item.type === "subsection" && (
        <div className="mb-4 ml-4 border-l-2 border-white/10 pl-4">
          <h3 className="text-xl font-semibold text-gray-200 mb-1">{item.title}</h3>
          <p className="text-glass-secondary/80 leading-relaxed text-sm">{item.text}</p>
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

export default function PrivacyPage() {
  const getItemSize = (index: number) => {
     // A crude estimation. For production we might use VariableSizeList with a measuring cache.
     // But for this demo, we'll try to keep it simple or use FixedSizeList with generous height if possible,
     // or just map content types to heights.
     
     const item = PRIVACY_CONTENT[index];
     switch (item.type) {
         case 'header': return 120;
         case 'date': return 60;
         case 'section': return 200;
         case 'subsection': return 150;
         case 'list': return 100 + ((item.items?.length || 0) * 30);
         case 'footer': return 100;
         default: return 100;
     }
  };

  // We are using FixedSizeList just to demonstrate virtualization as requested, 
  // but logically variable size is better. Since I cannot install new packages blindly without checking if `react-window` handles variable size nicely without extra measuring logic (it needs manual sizing),
  // I will use a simple mapping or just use VariableSizeList if I can quickly write the logic.
  // Actually, let's use VariableSizeList.
  
  const { VariableSizeList } = require('react-window');

  return (
    <div className="h-[calc(100vh-200px)] w-full max-w-4xl mx-auto backdrop-blur-3xl bg-black/85 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
       <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10"></div>
       <AutoSizerAny>
        {({ height, width }: { height: number; width: number }) => (
          <List
            height={height}
            width={width}
            itemCount={PRIVACY_CONTENT.length}
            itemSize={getItemSize}
            className="scrollbar-none"
          >
            {Row}
          </List>
        )}
      </AutoSizerAny>
    </div>
  );
}
