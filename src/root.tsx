import { Outlet } from "react-router-dom";
import Sidebar from "@/pages/Sidebar";

export default function Root() {
  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen bg-slate-50">
      <Sidebar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
