import { HelmetProvider } from "@dr.pogodin/react-helmet";
import ResponsiveWrapper from "./ResponsiveWrapper";
import { RouterProvider } from "react-router-dom";
import router from "./router/router";

function App() {
  return (
    <HelmetProvider>
      <ResponsiveWrapper>
        <RouterProvider router={router} />
      </ResponsiveWrapper>
    </HelmetProvider>
  );
}
export default App;
