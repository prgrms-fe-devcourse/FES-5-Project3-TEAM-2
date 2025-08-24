import { createBrowserRouter, redirect, type LoaderFunctionArgs } from "react-router";
import { supabase } from "../lib/supabaseClient";
import AuthCallback from "../pages/AuthCallback";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Root from "../root";


// const routes = [
//   {
//     path:'/',
//     Component: Root,
//     children: [
//       {
//         text:'홈',
//         path:'/',
//         Component: Home,
//       },
//       {
//         text:'대시보드',
//         path:'dashboard',
//         Component: Dashboard,
//       },
//     ]
//   }
// ]

// const router = createBrowserRouter(routes, {
//   basename: import.meta.env.BASE_URL,
// });

// export default router;

const Loading = () => (
  <div className="p-6 text-center text-gray-800">초기 로딩중...</div>
);

async function requireAuth(){
  const {data : {session}} = await supabase.auth.getSession();
  if(!session) throw redirect("/?from=dashboard");
  return null;
}

async function redirectToMyUid() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw redirect("/?from=dashboard");
  throw redirect(`/dashboard/${session.user.id}`);
}

async function requireOwnId({params} : LoaderFunctionArgs){
  const {data:{session}} = await supabase.auth.getSession();
  if(!session) throw redirect("/?from=dashboard");
  const myUid = session.user.id;
  const urlId = params.id;
  if(!urlId || urlId !== myUid){
    throw redirect(`/dashboard/${myUid}`);
  }
  return null;
}

const router = createBrowserRouter([
  {
    path:'/',
    element: <Root />,
    HydrateFallback: Loading,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path:'auth/callback',
        element: <AuthCallback />,
      },
      {
        path:'dashboard',
        loader: requireAuth,
        children: [
          {index: true, loader:redirectToMyUid, element: <Dashboard />},
          {path: ":id", loader:requireOwnId, element: <Dashboard />},
        ]
      },
    ]
  }
],
)

export default router;
