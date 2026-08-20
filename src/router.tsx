import { createBrowserRouter } from "react-router-dom";
import { DashboardPage } from "./features/daily-reading/DashboardPage";
import { LoginPage } from "./features/auth/LoginPage";
import { SignupPage } from "./features/auth/SignupPage";
import { ProgressPage } from "./features/progress/ProgressPage";
import { NotePage } from "./features/notes/NotePage";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/progress", element: <ProgressPage /> },
      { path: "/notes", element: <NotePage /> },
    ],
  },
]);
