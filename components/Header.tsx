"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Cpu, Menu, X } from "lucide-react";
import LoginButton from "@/components/auth/LoginButton";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled &&
          "bg-white/95 backdrop-blur-2xl border-b border-zinc-200/50 shadow-lg shadow-purple-500/5"
      )}
    >
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-3 rounded-2xl shadow-lg shadow-purple-500/25 ring-2 ring-white/10">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 bg-clip-text text-transparent tracking-tight">
              Otto
            </span>
          </div>

          {/* Desktop Nav - Modern Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-3 ml-4">
              <LoginButton />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-zinc-600 hover:text-purple-600 p-3 rounded-xl hover:bg-purple-50 transition-all duration-200"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-2xl border-t border-zinc-200/50 shadow-lg">
          <nav className="flex flex-col space-y-2 p-6">
            <div className="border-t border-zinc-200 pt-4 mt-4 space-y-3">
              <LoginButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
