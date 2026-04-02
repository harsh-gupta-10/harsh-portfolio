import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
