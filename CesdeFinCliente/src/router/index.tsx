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
import Deposit from '../pages/Deposit';
import BankDeposit from '../pages/BankDeposit';
import CardDeposit from '../pages/CardDeposit';
import CashDeposit from '../pages/CashDeposit';
import Withdraw from '../pages/Withdraw';
import Transfer from '../pages/Transfer';
import TransactionHistory from '../pages/TransactionHistory';
import EditProfile from '../pages/EditProfile';
import ChangePassword from '../pages/ChangePassword';
import AccountSettings from '../pages/AccountSettings';

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
        path: 'deposit/bank',
        element: (
          <ProtectedRoute>
            <BankDeposit />
          </ProtectedRoute>
        )
      },
      {
        path: 'deposit/card',
        element: (
          <ProtectedRoute>
            <CardDeposit />
          </ProtectedRoute>
        )
      },
      {
        path: 'deposit/cash',
        element: (
          <ProtectedRoute>
            <CashDeposit />
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
            <TransactionHistory />
          </ProtectedRoute>
        )
      },
      {
        path: 'edit-profile',
        element: (
          <ProtectedRoute>
            <EditProfile />
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
      },
      {
        path: 'account-settings',
        element: (
          <ProtectedRoute>
            <AccountSettings />
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