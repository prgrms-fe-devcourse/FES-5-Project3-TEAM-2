import Sidebar from "@/components/common/Sidebar";
import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div className="grid grid-cols-[248px_1fr] h-dvh overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
