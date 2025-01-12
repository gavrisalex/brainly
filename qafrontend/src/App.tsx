import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./pages/Home";
import { LoginForm } from "./LoginForm";
import { ProfileForm } from "./ProfileForm";
import { Dashboard } from "./pages/Dashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AddQuestion } from "./pages/AddQuestion";
import { QuestionDetail } from "./pages/QuestionDetail";
import { Profile } from "./pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: (
          <div className="flex flex-col justify-center items-center h-screen">
            <div className="mb-4 text-xl font-bold">Login</div>
            <LoginForm />
          </div>
        ),
      },
      {
        path: "register",
        element: (
          <div className="flex flex-col justify-center items-center h-screen">
            <div className="mb-4 text-xl font-bold">Create Account</div>
            <ProfileForm />
          </div>
        ),
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "ask",
        element: <AddQuestion />,
      },
      {
        path: "/question/:id",
        element: <QuestionDetail />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
