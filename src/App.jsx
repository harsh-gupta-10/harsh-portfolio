import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";

// ── EAGER (small, always needed) ──────────────────
import { useDarkMode } from "./hooks/useDarkMode";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

// ── LAZY PORTFOLIO (heavy sections) ───────────────
const Projects     = lazy(() => import("./components/Projects"));
const Achievements = lazy(() => import("./components/Achievements"));
const Certificates = lazy(() => import("./components/Certificates"));

// ── LAZY PUBLIC VIEWS ─────────────────────────────
const PublicInvoiceView  = lazy(() => import("./pages/public/PublicInvoiceView"));
const PublicProposalView = lazy(() => import("./pages/public/PublicProposalView"));
const PublicWhiteboardView = lazy(() => import("./pages/public/PublicWhiteboardView"));
const AllProjects = lazy(() => import("./pages/public/AllProjects"));

// ── LAZY ADMIN PAGES ──────────────────────────────
const Login           = lazy(() => import("./pages/admin/Login"));
const Dashboard       = lazy(() => import("./pages/admin/Dashboard"));
const AdminProjects   = lazy(() => import("./pages/admin/Projects"));
const ProjectDetail   = lazy(() => import("./pages/admin/ProjectDetail"));
const Messages        = lazy(() => import("./pages/admin/Messages"));
const Clients         = lazy(() => import("./pages/admin/Clients"));
const ClientDetail    = lazy(() => import("./pages/admin/ClientDetail"));
const Invoices        = lazy(() => import("./pages/admin/Invoices"));
const InvoiceForm     = lazy(() => import("./pages/admin/InvoiceForm"));
const InvoicePreview  = lazy(() => import("./pages/admin/InvoicePreview"));
const EmailTracker    = lazy(() => import("./pages/admin/EmailTracker"));
const Leads           = lazy(() => import("./pages/admin/Leads"));
const Proposals       = lazy(() => import("./pages/admin/Proposals"));
const ProposalBuilder = lazy(() => import("./pages/admin/ProposalBuilder"));
const Expenses        = lazy(() => import("./pages/admin/Expenses"));
const Tasks           = lazy(() => import("./pages/admin/Tasks"));
const Analytics       = lazy(() => import("./pages/admin/Analytics"));
const Settings        = lazy(() => import("./pages/admin/Settings"));
const Team            = lazy(() => import("./pages/admin/Team"));
const TeamPermissions = lazy(() => import("./pages/admin/TeamPermissions"));
const AcceptInvite    = lazy(() => import("./pages/admin/AcceptInvite"));
const Unauthorized    = lazy(() => import("./pages/admin/Unauthorized"));
const Notes           = lazy(() => import("./pages/admin/Notes"));
const NoteEditor      = lazy(() => import("./pages/admin/NoteEditor"));

// ── PORTFOLIO ─────────────────────────────────────
function Portfolio() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className={isDark ? "dark" : ""}>
      <Navbar isDark={isDark} toggleDark={toggle} />
      <main>
        <Hero isDark={isDark} />
        <About isDark={isDark} />
        <Skills isDark={isDark} />
        <ErrorBoundary><Projects isDark={isDark} /></ErrorBoundary>
        <Experience isDark={isDark} />
        <ErrorBoundary><Achievements isDark={isDark} /></ErrorBoundary>
        <ErrorBoundary><Certificates isDark={isDark} /></ErrorBoundary>
        <Contact isDark={isDark} />
      </main>
      <Footer isDark={isDark} />
    </div>
  );
}

// ── APP ───────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Portfolio ── */}
              <Route path="/" element={
                <ErrorBoundary><Portfolio /></ErrorBoundary>
              } />
              <Route path="/projects" element={
                <ErrorBoundary><AllProjects /></ErrorBoundary>
              } />

              {/* ── Auth (public) ── */}
              <Route path="/login" element={
                <ErrorBoundary><Login /></ErrorBoundary>
              } />
              <Route path="/invite" element={
                <ErrorBoundary><AcceptInvite /></ErrorBoundary>
              } />

              {/* ── Public Document Views (no auth, auto-tracks) ── */}
              <Route path="/view/invoice/:token" element={
                <ErrorBoundary><PublicInvoiceView /></ErrorBoundary>
              } />
              <Route path="/view/proposal/:token" element={
                <ErrorBoundary><PublicProposalView /></ErrorBoundary>
              } />
              <Route path="/view/whiteboard/:token" element={
                <ErrorBoundary><PublicWhiteboardView /></ErrorBoundary>
              } />

              {/* ── Admin Panel (protected) ── */}
              <Route
                path="/admin"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              >
                <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                <Route path="analytics" element={<ErrorBoundary><Analytics /></ErrorBoundary>} />
                <Route path="projects" element={<ErrorBoundary><AdminProjects /></ErrorBoundary>} />
                <Route path="projects/:id" element={<ErrorBoundary><ProjectDetail /></ErrorBoundary>} />
                <Route path="messages" element={<ErrorBoundary><Messages /></ErrorBoundary>} />
                <Route path="clients" element={<ErrorBoundary><Clients /></ErrorBoundary>} />
                <Route path="clients/:id" element={<ErrorBoundary><ClientDetail /></ErrorBoundary>} />
                <Route path="invoices" element={<ErrorBoundary><Invoices /></ErrorBoundary>} />
                <Route path="invoices/new" element={<ErrorBoundary><InvoiceForm /></ErrorBoundary>} />
                <Route path="invoices/:id" element={<ErrorBoundary><InvoicePreview /></ErrorBoundary>} />
                <Route path="invoices/:id/edit" element={<ErrorBoundary><InvoiceForm /></ErrorBoundary>} />
                <Route path="email-tracker" element={<ErrorBoundary><EmailTracker /></ErrorBoundary>} />
                <Route path="tasks" element={<ErrorBoundary><Tasks /></ErrorBoundary>} />
                <Route path="expenses" element={<ErrorBoundary><Expenses /></ErrorBoundary>} />
                <Route path="leads" element={<ErrorBoundary><Leads /></ErrorBoundary>} />
                <Route path="proposals" element={<ErrorBoundary><Proposals /></ErrorBoundary>} />
                <Route path="proposals/:id" element={<ErrorBoundary><ProposalBuilder /></ErrorBoundary>} />
                <Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
                <Route path="team" element={<ErrorBoundary><Team /></ErrorBoundary>} />
                <Route path="team/:id" element={<ErrorBoundary><TeamPermissions /></ErrorBoundary>} />
                <Route path="notes" element={<ErrorBoundary><Notes /></ErrorBoundary>} />
                <Route path="notes/:id" element={<ErrorBoundary><NoteEditor /></ErrorBoundary>} />
                <Route path="unauthorized" element={<ErrorBoundary><Unauthorized /></ErrorBoundary>} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
