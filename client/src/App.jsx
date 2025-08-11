import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";

const HomePage = lazy(() => import("@/pages/HomePage"));
const SubjectsPage = lazy(() => import("@/pages/SubjectsPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const BlogsPage = lazy(() => import("@/pages/BlogsPage"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const TermsAndConditionsPage = lazy(() =>
  import("@/pages/TermsAndConditionsPage")
);
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const PremiumServicePage = lazy(() => import("@/pages/PremiumServicePage"));
const ChatbotWidget = lazy(() => import("@/components/ChatbotWidget"));

const Register = lazy(() => import("./components/account/register"));
const AdminDashboard = lazy(() =>
  import("./components/admin/components/AdminDashboard")
);
const UserDetailPage = lazy(() =>
  import("./pages/AdminPages/UserDetailPage")
);
const LoginForm = lazy(() => import("./components/account/LoginForm.jsx"));
const TutorDashboardPage = lazy(() =>
  import("./pages/TutorPages/TutorDashboardPage")
);
const TutorAvailabilityPage = lazy(() =>
  import("./pages/TutorPages/TutorAvailabilityPage")
);
const StudentDashboardPage = lazy(() =>
  import("./pages/StudentPages/StudentDashboardPage")
);
const StudentTutorSearchPage = lazy(() =>
  import("./pages/StudentPages/StudentTutorSearchPage")
);
const StudentRequestHelpPage = lazy(() =>
  import("./pages/StudentPages/StudentRequestHelpPage")
);
const TutorProfilePage = lazy(() =>
  import("./pages/TutorPages/TutorProfilePage")
);
const ParentDashboardPage = lazy(() =>
  import("./pages/ParentPages/ParentDashboardPage")
);

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/blog" element={<BlogsPage />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/terms-and-conditions"
                element={<TermsAndConditionsPage />}
              />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route
                path="/premium-programme"
                element={<PremiumServicePage />}
              />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/user-detail/:tabValue" element={<UserDetailPage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/tutor-dashboard" element={<TutorDashboardPage />} />
              <Route
                path="/tutor-dashboard/availability"
                element={<TutorAvailabilityPage />}
              />
              <Route
                path="/student-dashboard/"
                element={<StudentDashboardPage />}
              />
              <Route
                path="/student/tutor-search"
                element={<StudentTutorSearchPage />}
              />
              <Route
                path="/student/request-help"
                element={<StudentRequestHelpPage />}
              />
              <Route path="/tutor" element={<TutorProfilePage />} />
              <Route
                path="/parent-dashboard"
                element={<ParentDashboardPage />}
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </Layout>
      <Toaster />
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </>
  );
}

export default App;
