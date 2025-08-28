import { Outlet } from "react-router-dom";
import Sidebar from "@/components/common/Sidebar";

export default function Root() {
  return (
    <div className="grid grid-cols-[240px_1fr] h-dvh overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="p-6 min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
