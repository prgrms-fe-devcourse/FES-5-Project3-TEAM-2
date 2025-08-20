
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { RouterProvider } from 'react-router-dom';
import router from './router/router';

function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
export default App;
