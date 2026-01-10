import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, HelpCircle, Mail, RotateCcw, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function meta({}: any) {
  return [
    { title: "Support - TaskHub" },
    { name: "description", content: "TaskHub Support Center" },
  ];
}

type DecisionNode = {
  id: string;
  question: string;
  options: { label: string; nextId: string }[];
  icon?: React.ReactNode;
};

type ResolutionNode = {
  id: string;
  title: string;
  content: string;
  action?: { label: string; href: string };
  icon?: React.ReactNode;
};

type Node = DecisionNode | ResolutionNode;

const DECISION_TREE: Record<string, Node> = {
  root: {
    id: "root",
    question: "What can we help you with today?",
    options: [
      { label: "Account & Login", nextId: "account_issues" },
      { label: "Billing & Subscription", nextId: "billing_issues" },
      { label: "Technical Issue", nextId: "tech_issues" },
      { label: "Feature Request", nextId: "feature_request" },
    ],
    icon: <HelpCircle className="w-12 h-12 text-[#00FFFF]" />,
  },
  account_issues: {
    id: "account_issues",
    question: "What kind of account issue are you facing?",
    options: [
      { label: "I forgot my password", nextId: "forgot_password" },
      { label: "I can't sign up", nextId: "signup_issue" },
      { label: "Account locked/banned", nextId: "contact_support" },
    ],
    icon: <ShieldAlert className="w-12 h-12 text-orange-400" />,
  },
  forgot_password: {
    id: "forgot_password",
    title: "Reset Your Password",
    content: "Don't worry, it happens! You can reset your password by clicking the link below. We'll send a recovery email to your inbox.",
    action: { label: "Reset Password", href: "/forgot-password" },
    icon: <RotateCcw className="w-12 h-12 text-[#00FF00]" />,
  },
  signup_issue: {
    id: "signup_issue",
    title: "Sign Up Troubleshooting",
    content: "Please ensure your email is valid and you are not using a disposable email address. If the issue persists, try clearing your browser cache.",
    action: { label: "System Status", href: "/status" },
  },
  contact_support: {
    id: "contact_support",
    title: "Contact Support",
    content: "It looks like this issue requires human assistance. Please contact our support team directly.",
    action: { label: "Contact Us", href: "/contact" },
    icon: <Mail className="w-12 h-12 text-pink-500" />,
  },
  billing_issues: {
    id: "billing_issues",
    question: "Is this about a recent charge or a plan change?",
    options: [
      { label: "Unrecognized Charge", nextId: "contact_support" },
      { label: "Upgrade/Downgrade Plan", nextId: "plan_change" },
    ],
  },
  plan_change: {
    id: "plan_change",
    title: "Managing Your Plan",
    content: "You can manage your subscription directly from your dashboard settings under the 'Billing' tab.",
    action: { label: "Go to Billing", href: "/dashboard/settings/billing" },
  },
  tech_issues: {
    id: "tech_issues",
    question: "Which platform are you using?",
    options: [
      { label: "Web Browser", nextId: "browser_issue" },
      { label: "Mobile App", nextId: "mobile_issue" },
    ],
  },
  browser_issue: {
    id: "browser_issue",
    title: "Browser Troubleshooting",
    content: "Please try disabling extensions or using Incognito mode. If that fixes it, an extension might be interfering.",
  },
  mobile_issue: {
    id: "mobile_issue",
    title: "Mobile App Troubleshooting",
    content: "Please ensure you have the latest version of the app installed. Try reinstalling the app if it keeps crashing.",
  },
  feature_request: {
    id: "feature_request",
    title: "Request a Feature",
    content: "We love hearing from you! Please visit our feedback board to vote on existing requests or submit a new one.",
    action: { label: "Feedback Board", href: "https://feedback.taskhub.com" },
  },
};

export default function SupportPage() {
  const [history, setHistory] = useState<string[]>(["root"]);
  const [direction, setDirection] = useState(1);

  const currentNodeId = history[history.length - 1];
  const currentNode = DECISION_TREE[currentNodeId];

  const handleOptionClick = (nextId: string) => {
    setDirection(1);
    setHistory((prev) => [...prev, nextId]);
  };

  const handleBack = () => {
    if (history.length > 1) {
      setDirection(-1);
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  const handleReset = () => {
    setDirection(-1);
    setHistory(["root"]);
  };

  const isResolution = !("options" in currentNode);

  return (
    <div className="w-full max-w-2xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter text-white mb-4">Support Center</h1>
        <p className="text-glass-secondary">Let's find a solution for you.</p>
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentNodeId}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="w-full"
          >
            <div className="rounded-3xl p-6 md:p-8 deep-glass hover:-translate-y-1 transition-all duration-300">
               
               <div className="relative z-10 flex flex-col items-center text-center">
                  {currentNode.icon && (
                    <div className="mb-6 p-4 rounded-2xl deep-glass-sm">
                        {currentNode.icon}
                    </div>
                  )}

                  {!isResolution ? (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-8">{currentNode.question}</h2>
                      <div className="grid grid-cols-1 w-full gap-4">
                        {(currentNode as DecisionNode).options.map((option) => (
                          <button
                            key={option.nextId}
                            onClick={() => handleOptionClick(option.nextId)}
                            className="w-full p-4 rounded-xl deep-glass-sm hover:-translate-y-0.5 hover:scale-[1.01] border border-white/10 hover:border-[#00FFFF]/50 transition-all duration-300 text-left flex items-center justify-between group"
                          >
                            <span className="font-medium text-gray-200 group-hover:text-white">{option.label}</span>
                            <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity text-[#00FFFF]" />
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-[#00FF00]/10 flex items-center justify-center mb-6 border border-[#00FF00]/20">
                          <CheckCircle className="w-8 h-8 text-[#00FF00]" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-4">{(currentNode as ResolutionNode).title}</h2>
                      <p className="text-glass-secondary mb-8 leading-relaxed">{(currentNode as ResolutionNode).content}</p>
                      
                      {(currentNode as ResolutionNode).action && (
                        <Button className="w-full bg-[#00FFFF] text-black hover:bg-[#00FFFF]/90 font-bold h-12 rounded-xl">
                          <a href={(currentNode as ResolutionNode).action!.href}>
                            {(currentNode as ResolutionNode).action!.label}
                          </a>
                        </Button>
                      )}
                    </>
                  )}
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {history.length > 1 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleReset}
            className="text-sm font-medium text-gray-400 hover:text-[#00FFFF] transition-colors"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
