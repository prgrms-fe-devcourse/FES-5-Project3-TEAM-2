import { Outlet } from "react-router-dom";
import GroupPresenceProvider from "./GroupPresenceProvider";

export default function GroupLayout() {
  return (
    <GroupPresenceProvider>
      <Outlet />
    </GroupPresenceProvider>
  );
}

