import React from "react";

export function meta({}: any) {
  return [
    { title: "Terms of Service - TaskHub" },
    { name: "description", content: "Terms of Service for TaskHub" },
  ];
}

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using TaskHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. We reserve the right to modify these terms at any time."
  },
  {
    title: "2. Description of Service",
    content: "TaskHub provides a project management and team collaboration platform. We offer various features including task management, project tracking, team communication, and analytics tools."
  },
  {
    title: "3. User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account."
  },
  {
    title: "4. Acceptable Use",
    content: "You agree not to use TaskHub for any unlawful purpose or in any way that could damage, disable, or impair our services. You may not attempt to gain unauthorized access to any part of the service."
  },
  {
    title: "5. Intellectual Property",
    content: "TaskHub and its original content, features, and functionality are owned by TaskHub and are protected by international copyright, trademark, and other intellectual property laws."
  },
  {
    title: "6. User Content",
    content: "You retain ownership of any content you submit to TaskHub. By submitting content, you grant us a license to use, modify, and display that content in connection with providing our services."
  },
  {
    title: "7. Termination",
    content: "We may terminate or suspend your account at any time without prior notice if you breach these Terms. Upon termination, your right to use the service will immediately cease."
  },
  {
    title: "8. Limitation of Liability",
    content: "TaskHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service."
  },
  {
    title: "9. Governing Law",
    content: "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TaskHub operates, without regard to conflict of law principles."
  },
  {
    title: "10. Contact Information",
    content: "If you have any questions about these Terms, please contact us at legal@taskhub.com or through our support channels."
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-glass-hero-morph mb-6">
            Terms of Service
          </h1>
          <p className="text-white/50 text-sm font-mono">
            Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl p-8 md:p-12 deep-glass">
          <p className="text-white/70 leading-relaxed mb-12">
            Welcome to TaskHub. Please read these Terms of Service carefully before using our platform. By using TaskHub, you agree to be bound by these terms.
          </p>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section, index) => (
              <div key={index} className="border-l-2 border-white/10 pl-6 hover:border-white/30 transition-colors">
                <h2 className="text-xl md:text-2xl font-bold text-glass-heading-morph mb-3">
                  {section.title}
                </h2>
                <p className="text-white/60 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm">
              Questions about our terms?{" "}
              <a href="mailto:legal@taskhub.com" className="footer-glass-link">
                Contact our legal team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
