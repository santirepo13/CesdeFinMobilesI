import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { ProtectedRoute, PublicRoute } from '../components/ProtectedRoute';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Dashboard } from '../pages/Dashboard';
import { Services } from '../pages/Services';
import { Contact } from '../pages/Contact';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        )
      },
      {
        path: 'signup',
        element: (
          <PublicRoute>
            <Signup />
          </PublicRoute>
        )
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'services',
        element: (
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        )
      },
      {
        path: 'contact',
        element: (
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        )
      }
    ]
  }
]);

export const AppRouter = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};