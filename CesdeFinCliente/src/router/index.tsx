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

// Placeholder components for routes not yet created
const Deposit = () => <div className="container py-4"><h2>Consignar</h2><p>Página en construcción...</p></div>;
const Withdraw = () => <div className="container py-4"><h2>Retirar</h2><p>Página en construcción...</p></div>;
const Transfer = () => <div className="container py-4"><h2>Transferir</h2><p>Página en construcción...</p></div>;
const History = () => <div className="container py-4"><h2>Movimientos</h2><p>Página en construcción...</p></div>;
const EditUser = () => <div className="container py-4"><h2>Editar Usuario</h2><p>Página en construcción...</p></div>;
const ChangePassword = () => <div className="container py-4"><h2>Cambiar Clave</h2><p>Página en construcción...</p></div>;

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
      },
      {
        path: 'deposit',
        element: (
          <ProtectedRoute>
            <Deposit />
          </ProtectedRoute>
        )
      },
      {
        path: 'withdraw',
        element: (
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        )
      },
      {
        path: 'transfer',
        element: (
          <ProtectedRoute>
            <Transfer />
          </ProtectedRoute>
        )
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        )
      },
      {
        path: 'edit-user',
        element: (
          <ProtectedRoute>
            <EditUser />
          </ProtectedRoute>
        )
      },
      {
        path: 'change-password',
        element: (
          <ProtectedRoute>
            <ChangePassword />
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