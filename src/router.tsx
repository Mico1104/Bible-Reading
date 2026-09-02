import { createBrowserRouter } from "react-router-dom";
import { DashboardPage } from "./features/daily-reading/DashboardPage";
import { LoginPage } from "./features/auth/LoginPage";
import { SignupPage } from "./features/auth/SignupPage";
import { ProgressPage } from "./features/progress/ProgressPage";
import { NotePage } from "./features/notes/NotePage";
import { LandingPage } from "./features/landing/LandingPage";
import { Layout } from "./components/Layout";
import { NotFoundPage } from "./components/NotFoundPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ForgotPasswordPage } from "./features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/login", element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/progress", element: <ProgressPage /> },
          { path: "/notes", element: <NotePage /> },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
      {path: "/forgot-password", element: <ForgotPasswordPage/>},
      {path: "/reset-password", element: <ResetPasswordPage/>}
    ],
  },
]);
