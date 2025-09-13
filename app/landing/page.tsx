import Header from "@/components/Header";
import WorkflowSection from "@/components/WorkflowSection";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main className="pt-16">
          <WorkflowSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}