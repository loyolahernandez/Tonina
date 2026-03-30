"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import About from "./components/About";
import ValueProps from "./components/ValueProps";
import Programs from "./components/Programs";
import Differentiator from "./components/Differentiator";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import CTASection from "./components/CTASection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import KoalaBot from "./components/KoalaBot";

export default function KoalaPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <StatsBar />
      <About />
      <ValueProps />
      <Programs />
      <Differentiator />
      <Gallery />
      <Testimonials />
      <CTASection />
      <ContactSection />
      <Footer />
      {/* Bot integrado con Supabase — reemplaza bot.js del sitio estático */}
      <KoalaBot />
    </main>
  );
}
