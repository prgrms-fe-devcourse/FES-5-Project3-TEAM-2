import { createBrowserRouter } from "react-router";
import DashBoard from "../pages/DashBoard";
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


const router = createBrowserRouter([
  {
    path:'/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path:'dashboard',
        element: <DashBoard />,
      }
    ]
  }
])

export default router;
