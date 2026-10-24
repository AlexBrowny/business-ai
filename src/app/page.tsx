import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { SectionDivider } from "@/components/fx/SectionDivider";
import { BackToTop } from "@/components/fx/BackToTop";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Benefits } from "@/components/sections/Benefits";
import { AssistantDemo } from "@/components/sections/AssistantDemo";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { LeadForm } from "@/components/sections/LeadForm";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <SmoothScroll />
      <ScrollProgress />
      <Hero />
      <Stats />
      <Benefits />
      <SectionDivider />
      <AssistantDemo />
      <Process />
      <SectionDivider />
      <Testimonials />
      <Faq />
      <LeadForm />
      <Footer />
      <ChatWidget />
      <BackToTop />
    </main>
  );
}
