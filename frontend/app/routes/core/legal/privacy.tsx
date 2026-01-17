import React from "react";

export function meta({}: any) {
  return [
    { title: "Privacy Policy - TaskHub" },
    { name: "description", content: "Privacy Policy for TaskHub" },
  ];
}

const sections = [
  {
    title: "1. Information We Collect",
    content: "We collect information you provide directly to us, such as when you create an account, update your profile, submit a form, or contact us. This may include your name, email address, and any other information you choose to provide."
  },
  {
    title: "2. How We Use Your Information",
    content: "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions."
  },
  {
    title: "3. Information Sharing",
    content: "We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf, or when required by law."
  },
  {
    title: "4. Data Security",
    content: "We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. All data is encrypted in transit and at rest."
  },
  {
    title: "5. Your Rights",
    content: "You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting our support team."
  },
  {
    title: "6. Cookies",
    content: "We use cookies and similar tracking technologies to collect and track information about your browsing activity. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent."
  },
  {
    title: "7. Changes to This Policy",
    content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date."
  },
  {
    title: "8. Contact Us",
    content: "If you have any questions about this Privacy Policy, please contact us at privacy@taskhub.com or through our contact form."
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-glass-hero-morph mb-6">
            Privacy Policy
          </h1>
          <p className="text-white/50 text-sm font-mono">
            Last Updated: January 1, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl p-8 md:p-12 deep-glass">
          <p className="text-white/70 leading-relaxed mb-12">
            At TaskHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
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
              If you have questions about this policy, please contact us at{" "}
              <a href="mailto:privacy@taskhub.com" className="footer-glass-link">
                privacy@taskhub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
