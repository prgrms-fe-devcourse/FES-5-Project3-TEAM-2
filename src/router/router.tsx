import { createBrowserRouter, redirect } from "react-router-dom";
import Root from "../root";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import { supabase } from "@/lib/supabaseClient";
import GroupsPage from "@/pages/GroupsPage";
import Budget from "@/pages/BudgetPage";
import Album from "@/pages/AlbumPage";

/** 로그인 요구 */
async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw redirect("/");
  return null;
}

/** 그룹 로더: 존재 + 멤버십 확인 후 그룹 데이터 반환 */
async function loadGroup({ params }: { params: any }) {
  await requireAuth();
  const groupId = params.groupId;

  const { data: group, error: gErr } = await supabase
    .from("groups").select("id,name").eq("id", groupId).single();
  if (gErr || !group) throw redirect("/groups");

  const { data: member } = await supabase
    .from("group_members").select("group_id").eq("group_id", groupId).limit(1);
  if (!member || member.length === 0) throw redirect("/groups");

  return group; 
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },

      // 그룹 관리: 로그인만 확인
      { path: "groups", element: <GroupsPage />, loader: requireAuth },

      // 그룹 내부: 로더에서 멤버십 확인 + 그룹 데이터 공급
      {
        path: "g/:groupId",
        loader: loadGroup,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "budget", element: <Budget /> },
          { path: "album", element: <Album /> },
        ],
      },
    ],
  },
]);

export default router;
