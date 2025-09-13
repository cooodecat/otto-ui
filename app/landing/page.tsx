import Header from "@/components/Header";
import WorkflowSection from "@/components/WorkflowSection";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50">
      <Header />
      <main className="pt-16">
        <WorkflowSection />
      </main>
      <Footer />
    </div>
  );
}