import { Outlet } from "react-router-dom";

export default function HomeLayout() {
  return (
    <div className="min-h-dvh">
      <Outlet />
    </div>
  );
}