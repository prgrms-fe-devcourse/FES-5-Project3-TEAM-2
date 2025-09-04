import { supabase } from "@/lib/supabaseClient";
import Album from "@/pages/Album";
import AuthCallback from "@/pages/Auth/AuthCallback";
import BudgetPage from "@/pages/Budget/index";
import GroupJoinPage from "@/pages/Group/pages/GroupJoinPage";
import GroupLayout from "@/pages/Group/components/GroupLayout";
import GroupsPage from "@/pages/Group/pages/GroupsPage";
import NotFound from "@/pages/NotFound";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  type LoaderFunctionArgs,
} from "react-router-dom";
import HomeLayout from "../HomeLayout";
import DashBoard from "../pages/DashBoard/index";
import Home from "../pages/Home";
import Root from "../root";
import { dashboardLoader } from "./loader/dashBoardLoader";

/** 로그인 요구 + userId 반환 */
async function requireAuthAndGetUserId() {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw redirect("/");
  return userId;
}

/** 그룹 로더: 존재 + 멤버십 확인 후 그룹 데이터 반환 */
async function loadGroup({ params }: LoaderFunctionArgs) {
  const myId = await requireAuthAndGetUserId(); // 세션 확인 + userId 확보
  const groupId = params.groupId;
  if (!groupId) throw redirect(`/groups/${myId}`);

  // 1) 그룹 존재 확인
  const { data: group, error: gErr } = await supabase
    .from("groups")
    .select("id,name")
    .eq("id", groupId)
    .single();
  if (gErr || !group) throw redirect(`/groups/${myId}`);

  // 2) 현재 로그인한 사용자가 이 그룹 멤버인지 확인 : user_id = myId
  const { data: member } = await supabase
    .from("groupmembers")
    .select("group_id")
    .eq("group_id", groupId)
    .eq("user_id", myId)
    .limit(1);

  if (!member || member.length === 0) throw redirect(`/groups/${myId}`);

  return group;
}

const router = createBrowserRouter([
  // 홈 전용 트리 (사이드바 없음)
  {
    path: "/",
    element: <HomeLayout />,
    children: [{ index: true, element: <Home /> }],
  },

  // AuthCallback 라우트 (콜백 처리)
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },

  // 앱 트리 (사이드바 있는 Root)
  {
    element: <Root />,
    children: [
      // /groups/:userId
      {
        path: "groups/:userId",
        element: <Outlet />,
        loader: async ({ params }: LoaderFunctionArgs) => {
          const myId = await requireAuthAndGetUserId();
          if (params.userId !== myId) {
            if (params.userId && params.userId !== myId) {
              throw redirect(`/groups/${myId}`);
            }
            return null;
          }
        },
        children: [
          { index: true, element: <GroupsPage /> },

          // /groups/:userId/g/:groupId
          {
            id: "group-layout",
            path: "g/:groupId",
            loader: loadGroup,
            element: <GroupLayout />,
            children: [
              { index: true, element: <DashBoard />, loader: dashboardLoader },
              { path: "budget", element: <BudgetPage /> },
              { path: "album", element: <Album /> },
            ],
          },
        ],
      },

      // 매직링크
      {
        path: "g/:groupId",
        element: <GroupJoinPage />,
      },
    ],
  },

  // 404
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
