import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectForm from "@/pages/ProjectForm";
import Blogs from "@/pages/Blogs";
import BlogForm from "@/pages/BlogForm";
import Skills from "@/pages/Skills";
import Messages from "@/pages/Messages";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/:id" element={<ProjectForm />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/new" element={<BlogForm />} />
            <Route path="blogs/:id" element={<BlogForm />} />
            <Route path="skills" element={<Skills />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
