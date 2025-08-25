import { supabase } from "@/lib/supabaseClient";
import Album from "@/pages/AlbumPage";
import AuthCallback from "@/pages/auth/AuthCallback";
import Budget from "@/pages/BudgetPage";
import GroupsPage from "@/pages/Group/GroupsPage";
import { createBrowserRouter, redirect, type LoaderFunctionArgs } from "react-router-dom";
import HomeLayout from "../HomeLayout";
import DashBoard from "../pages/DashBoard/index";
import Home from "../pages/Home";
import Root from "../root";


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

   // 1) 그룹 존재 확인
  const { data: group, error: gErr } = await supabase
    .from("groups").select("id,name").eq("id", groupId).single();
  // if (gErr || !group) throw redirect(`/groups/${myId}`); // ‼️테스트용으로 자동 redirect 주석처리 했습니다

  // 2) 현재 로그인한 사용자가 이 그룹 멤버인지 확인
  const { data: member } = await supabase
    .from("groupmembers").select("group_id").eq("group_id", groupId).limit(1);
  // if (!member || member.length === 0) throw redirect(`/groups/${myId}`); // ‼️테스트용으로 자동 redirect 주석처리 했습니다

  return group;
}

const router = createBrowserRouter([
  // 홈 전용 트리 (사이드바 없음)
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      { index: true, element: <Home /> },
    ],
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
      // 본인 일치 검증 포함
      { path: "groups/:userId",
        element: <GroupsPage />,
        loader: async({params}: LoaderFunctionArgs) => {
          const myId = await requireAuthAndGetUserId();
          if(params.userId !== myId) {
            throw redirect(`/groups/${myId}`);
          }
          return null;
        }},

      // 부모 라우트에 id 부여 → 자식 탭에서 useRouteLoaderData("group-layout")로 group 공유
      {
        id: "group-layout",
        path:'g/:groupId',
        loader: loadGroup,
        children: [
          {index:true, element: <DashBoard />},
          {path: "budget", element: <Budget />},
          {path: "album", element: <Album />},
        ]
      }
    ]
  }
])

export default router;
