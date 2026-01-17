import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone } from "lucide-react";

export function meta({}: any) {
  return [
    { title: "Contact Us - TaskHub" },
    { name: "description", content: "Contact TaskHub Support" },
  ];
}

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 grid lg:grid-cols-2 gap-16 items-start">
       {/* Info Side */}
       <div className="space-y-8">
           <div>
               <h1 className="text-5xl font-black tracking-tighter text-glass-hero-morph mb-6">Get in Touch</h1>
               <p className="text-xl text-glass-secondary leading-relaxed">
                   Have a question or just want to verify our existence? We're hearing you loud and clear. Drop us a line.
               </p>
           </div>

           <div className="space-y-6">
               <div className="flex items-center gap-4 p-6 rounded-2xl deep-glass hover:-translate-y-1 transition-all duration-300">
                   <div className="w-12 h-12 rounded-xl deep-glass-sm flex items-center justify-center text-white/80">
                       <Mail className="w-6 h-6" />
                   </div>
                   <div>
                       <div className="text-sm text-white/50 font-medium uppercase tracking-wider">Email</div>
                       <div className="text-lg text-white/90 font-semibold">hello@taskhub.com</div>
                   </div>
               </div>
               
               <div className="flex items-center gap-4 p-6 rounded-2xl deep-glass hover:-translate-y-1 transition-all duration-300">
                   <div className="w-12 h-12 rounded-xl deep-glass-sm flex items-center justify-center text-white/80">
                       <Phone className="w-6 h-6" />
                   </div>
                   <div>
                       <div className="text-sm text-white/50 font-medium uppercase tracking-wider">Phone</div>
                       <div className="text-lg text-white/90 font-semibold">+1 (555) 123-4567</div>
                   </div>
               </div>

               <div className="flex items-center gap-4 p-6 rounded-2xl deep-glass hover:-translate-y-1 transition-all duration-300">
                   <div className="w-12 h-12 rounded-xl deep-glass-sm flex items-center justify-center text-white/80">
                       <MapPin className="w-6 h-6" />
                   </div>
                   <div>
                       <div className="text-sm text-white/50 font-medium uppercase tracking-wider">HQ</div>
                       <div className="text-lg text-white/90 font-semibold">San Francisco, CA</div>
                   </div>
               </div>
           </div>
       </div>

       {/* Form Side */}
       <div className="rounded-3xl p-6 md:p-8 deep-glass hover:-translate-y-1 transition-all duration-300">
            
            <form className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white/70">First Name</Label>
                        <Input id="firstName" placeholder="John" className="bg-black/50 border-white/10 focus:border-white/50 h-12" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white/70">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" className="bg-black/50 border-white/10 focus:border-white/50 h-12" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/70">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" className="bg-black/50 border-white/10 focus:border-white/50 h-12" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message" className="text-white/70">Message</Label>
                    <Textarea 
                        id="message" 
                        placeholder="Tell us everything..." 
                        className="bg-black/50 border-white/10 focus:border-white/50 min-h-[150px] resize-none" 
                    />
                </div>

                <Button className="w-full h-12 bg-white/[0.08] backdrop-blur-xl border border-white/20 text-white hover:bg-white/[0.15] hover:border-white/30 font-bold text-lg rounded-xl transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    Send Message
                </Button>
            </form>
       </div>
    </div>
  );
}
