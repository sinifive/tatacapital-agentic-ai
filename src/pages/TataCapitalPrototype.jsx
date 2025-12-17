import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import LoginModal from "../components/LoginModal";
import Apply from "../components/Apply";
import ChatWidget from "../components/ChatWidget";
import LoansForYou from "../components/LoansForYou";
import LoansForBusiness from "../components/LoansForBusiness";
import Offers from "../components/Offers";
import MyApplications from "../components/MyApplications";
import BenefitsSection from "../components/BenefitsSection";
import HowItWorks from "../components/HowItWorks";
import TrustSection from "../components/TrustSection";
import FAQSection from "../components/FAQSection";
import { getSession, clearSession } from "../utils/sessionStorage";

// Single-file React component preview (Tailwind classes are used)
// Features:
// - Landing / Home page with Tata-like header and hero
// - Login modal
// - Apply Now button that requires login and then opens Application page
// - Corner chatbot widget (collapsible)
// - Simple session flow: guest -> login -> home or application

export default function TataCapitalPrototype() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [route, setRoute] = useState("home"); // home | apply | loans-personal | loans-business | offers | my-applications
  const [user, setUser] = useState({ name: "", pan: "", phone: "" });

  // Check for existing session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setLoggedIn(true);
      setUser(session.user);
    }
  }, []);

  function openApply() {
    if (!loggedIn) {
      setShowLogin(true);
      // mark intent to go to apply after login
      setRoute("apply");
    } else {
      setRoute("apply");
    }
  }

  function handleLoginSuccess(userData) {
    setUser(userData);
    setLoggedIn(true);
    setShowLogin(false);
    // Keep route as apply if it was set before login
  }

  function logout() {
    clearSession();
    setLoggedIn(false);
    setUser({ name: "", pan: "", phone: "" });
    setRoute("home");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white text-slate-800">
      {/* Header Component */}
      <Header
        onLoginClick={() => setShowLogin(true)}
        onApplyClick={openApply}
        isLoggedIn={loggedIn}
        userName={user.name}
        onLogout={logout}
        onNavigate={(newRoute) => setRoute(newRoute)}
      />

      {/* Main Content */}
      <main id="main-content">
        {route === "home" && (
          <>
            {/* Hero Component */}
            <Hero
              headline="Fast personal loans with friendly terms"
              subheadline="Apply in minutes. Instant pre-approval checks. Get a sanction letter without the wait."
              onApply={openApply}
              onExplore={() => setRoute("loans-personal")}
            />
            
            {/* Benefits Section */}
            <BenefitsSection />
            
            {/* How It Works Section */}
            <HowItWorks />
            
            {/* Trust Section */}
            <TrustSection />
            
            {/* FAQ Section */}
            <FAQSection />
          </>
        )}

        {route === "loans-personal" && (
          <LoansForYou onApply={openApply} />
        )}

        {route === "loans-business" && (
          <LoansForBusiness onApply={openApply} />
        )}

        {route === "offers" && (
          <Offers onApply={openApply} />
        )}

        {route === "my-applications" && (
          <MyApplications onBack={() => setRoute("home")} />
        )}

        {route === "apply" && (
          <>
            {!loggedIn ? (
              <section className="p-6 mt-8 bg-white rounded shadow max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Loan Application</h2>
                <div className="text-slate-600">Please login to continue with your application. The chatbot is available at the right corner to guide you.</div>
              </section>
            ) : (
              <Apply onNavigate={setRoute} />
            )}
          </>
        )}
      </main>

      {/* Chatbot Widget */}
      <ChatWidget onApplyClick={openApply} />

      {/* Footer */}
      <footer className="mt-12 p-6 text-center text-sm text-slate-500">© Tata Capital — Prototype UI</footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
