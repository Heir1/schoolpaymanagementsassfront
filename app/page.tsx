import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhatSchoolPayDoes from "@/components/WhatSchoolPayDoes";
import BeforeAfter from "@/components/BeforeAfter";
import TransparencyParents from "@/components/TransparencyParents";
import SimpleDataViz from "@/components/SimpleDataViz";
import SecurityResponsibility from "@/components/SecurityResponsibility";
import OfflineFriendly from "@/components/OfflineFriendly";
import HowItWorks from "@/components/HowItWorks";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <WhatSchoolPayDoes />
      <BeforeAfter />
      <TransparencyParents />
      <SimpleDataViz />
      <SecurityResponsibility />
      <OfflineFriendly />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </main>
  );
}
