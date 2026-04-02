import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";

// Portfolio
import { useDarkMode } from "./hooks/useDarkMode";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Achievements from "./components/Achievements";
import Certificates from "./components/Certificates";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

// Admin
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/Projects";
import ProjectDetail from "./pages/admin/ProjectDetail";
import Blogs from "./pages/admin/Blogs";
import BlogForm from "./pages/admin/BlogForm";
import AdminSkills from "./pages/admin/Skills";
import Messages from "./pages/admin/Messages";
import Clients from "./pages/admin/Clients";
import ClientDetail from "./pages/admin/ClientDetail";
import Invoices from "./pages/admin/Invoices";
import InvoiceForm from "./pages/admin/InvoiceForm";
import InvoicePreview from "./pages/admin/InvoicePreview";
import EmailTracker from "./pages/admin/EmailTracker";
import Leads from "./pages/admin/Leads";
import Proposals from "./pages/admin/Proposals";
import ProposalBuilder from "./pages/admin/ProposalBuilder";
import Expenses from "./pages/admin/Expenses";
import Tasks from "./pages/admin/Tasks";
import Analytics from "./pages/admin/Analytics";

function Portfolio() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className={isDark ? "dark" : ""}>
      <Navbar isDark={isDark} toggleDark={toggle} />
      <main>
        <Hero isDark={isDark} />
        <About isDark={isDark} />
        <Skills isDark={isDark} />
        <Projects isDark={isDark} />
        <Experience isDark={isDark} />
        <Achievements isDark={isDark} />
        <Certificates isDark={isDark} />
        <Contact isDark={isDark} />
      </main>
      <Footer isDark={isDark} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Portfolio */}
          <Route path="/" element={<Portfolio />} />

          {/* Admin Login */}
          <Route path="/login" element={<Login />} />

          {/* Admin Panel */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/new" element={<BlogForm />} />
            <Route path="blogs/:id" element={<BlogForm />} />
            <Route path="skills" element={<AdminSkills />} />
            <Route path="messages" element={<Messages />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceForm />} />
            <Route path="invoices/:id" element={<InvoicePreview />} />
            <Route path="invoices/:id/edit" element={<InvoiceForm />} />
            <Route path="email-tracker" element={<EmailTracker />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="leads" element={<Leads />} />
            <Route path="proposals" element={<Proposals />} />
            <Route path="proposals/:id" element={<ProposalBuilder />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
