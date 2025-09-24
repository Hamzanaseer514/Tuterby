import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import Layout from "@/components/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./Middleware/ProtectedRoute";

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
const AdminDashboardPage = lazy(() =>
  import("./pages/AdminPages/AdminDashboardPage")
);
const AdminUserDetailRouter = lazy(() =>
  import("./pages/AdminPages/AdminUserDetailRouter")
);
const LoginForm = lazy(() => import("./components/account/LoginForm.jsx"));
const TutorDashboardPage = lazy(() =>
  import("./pages/TutorPages/TutorDashboardPage")
);
const TutorAvailabilityPage = lazy(() =>
  import("./pages/TutorPages/TutorAvailabilityPage")
);
const TutorCreateSessionPage = lazy(() =>
  import("./pages/TutorPages/TutorCreateSessionPage")
);
const StudentDashboardPage = lazy(() =>
  import("./pages/StudentPages/StudentDashboardPage")
);
const StudentTutorSearchPage = lazy(() =>
  import("./pages/StudentPages/StudentTutorSearchPage")
);
const StudentSelfProfilePage = lazy(() =>
  import("./pages/StudentPages/StudentSelfProfilePage")
);
const StudentPaymentPage = lazy(() =>
  import("./pages/StudentPages/StudentPaymentPage")
);

const ParentDashboardPage = lazy(() =>
  import("./pages/ParentPages/ParentDashboardPage")
);

const TutorProfilePage = lazy(() =>
  import("./pages/TutorPages/TutorProfilePage")
);

const AdminSettings = lazy(() =>
  import("./pages/AdminPages/AdminSettings")
);

const TutorSessionsPage = lazy(() =>
  import("./pages/AdminPages/TutorSessionsPage")
);
const TutorPayments = lazy(() => import("./pages/AdminPages/TutorPyaments"));
const TutorReviewsPage = lazy(() =>
  import("./pages/AdminPages/TutorReviewsPage")
);
const TutorReviewsPageForTutor = lazy(() =>
  import("./pages/TutorPages/TutorReviewsPage")
);

const PaymentResult = lazy(() => import("./components/PaymentResult"));
const Chats = lazy(() => import("./components/admin/components/Chats.jsx"));

const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const PublicInterviewPage = lazy(() => import("./pages/PublicInterviewPage"));

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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>} />
              <Route path="/admin/user-detail/:tabValue" element={<ProtectedRoute allowedRoles={["admin"]}>
                <AdminUserDetailRouter />
              </ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}>
                <AdminSettings />
              </ProtectedRoute>} />
              <Route path="/admin/chats" element={<ProtectedRoute allowedRoles={["admin"]}>
                <Chats />
              </ProtectedRoute>} />
              <Route path="/admin/tutor-sessions" element={<ProtectedRoute allowedRoles={["admin"]}>
                <TutorSessionsPage />
              </ProtectedRoute>} />
              <Route path="/admin/tutor-payments" element={<ProtectedRoute allowedRoles={["admin"]}>
                <TutorPayments />
              </ProtectedRoute>} />
              <Route path="/admin/tutor-reviews" element={<ProtectedRoute allowedRoles={["admin"]}>
                <TutorReviewsPage />
              </ProtectedRoute>} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/tutor-dashboard" element={<ProtectedRoute allowedRoles={["tutor"]}>
                <TutorDashboardPage />
              </ProtectedRoute>} />
              <Route
                path="/tutor-dashboard/availability"
                element={<ProtectedRoute allowedRoles={["tutor"]}>
                  <TutorAvailabilityPage />
                </ProtectedRoute>}
              />
              <Route
                path="/tutor-dashboard/create-session"
                element={<ProtectedRoute allowedRoles={["tutor"]}>
                  <TutorCreateSessionPage />
                </ProtectedRoute>}
              />
              <Route
                path="/tutor-dashboard/reviews"
                element={<ProtectedRoute allowedRoles={["tutor"]}>
                  <TutorReviewsPageForTutor />
                </ProtectedRoute>}
              />
              <Route
                path="/student-dashboard/"
                element={<ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboardPage />
                </ProtectedRoute>}
              />
              <Route
                path="/student/profile"
                element={<ProtectedRoute allowedRoles={["student"]}>
                  <StudentSelfProfilePage />
                </ProtectedRoute>}
              />
              <Route
                path="/student/payments"
                element={<ProtectedRoute allowedRoles={["student"]}>
                  <StudentPaymentPage />
                </ProtectedRoute>}
              />
              <Route
                path="/student/tutor-search"
                element={<ProtectedRoute allowedRoles={["student"]}>
                  <StudentTutorSearchPage />
                </ProtectedRoute>}
              />
              <Route
                path="/parent-dashboard"
                element={<ProtectedRoute allowedRoles={["parent"]}>
                  <ParentDashboardPage />
                </ProtectedRoute>}
              />
              <Route
                path="/parent-dashboard/*"
                element={<ProtectedRoute allowedRoles={["parent"]}>
                  <ParentDashboardPage />
                </ProtectedRoute>}
              />
              <Route path="/payment-result" element={<PaymentResult />} />
              <Route path="/interview/:token" element={<PublicInterviewPage />} />
              <Route path="/tutor" element={<ProtectedRoute allowedRoles={["student","parent"]}>
                <TutorProfilePage />
              </ProtectedRoute>} />
            
              <Route

              />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
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
