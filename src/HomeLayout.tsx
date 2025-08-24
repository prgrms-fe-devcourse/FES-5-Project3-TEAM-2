import { Outlet } from "react-router-dom";

export default function HomeLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Outlet />
    </div>
  );
}