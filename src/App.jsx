import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { fetchAiResponseData, fetchUserData } from "./apis/apiServices";
import { restoreUserData, setAiData } from "./slices/userSlice";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Signup = lazy(() => import("./pages/Signup"));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout"));
const HomeDashboard = lazy(() => import("./pages/dashboard/Home"));
const History = lazy(() => import("./pages/dashboard/History"));
const Billing = lazy(() => import("./pages/dashboard/Billing"));
const Content = lazy(() => import("./pages/dashboard/Content"));

// Loading fallback component
const Loader = () => (
  <div className="flex justify-center items-center h-32">
    <PuffLoader />
  </div>
);

// Define routes with lazy loading
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Suspense fallback={<Loader />}>
          <Home />
        </Suspense>
      ),
    },
    {
      path: "/signin",
      element: (
        <Suspense fallback={<Loader />}>
          <SignIn />
        </Suspense>
      ),
    },
    {
      path: "/signup",
      element: (
        <Suspense fallback={<Loader />}>
          <Signup />
        </Suspense>
      ),
    },
    {
      path: "/dashboard",
      element: <ProtectedRoute />,
      children: [
        {
          element: (
            <Suspense fallback={<Loader />}>
              <DashboardLayout />
            </Suspense>
          ),
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<Loader />}>
                  <HomeDashboard />
                </Suspense>
              ),
            },
            {
              path: "history",
              element: (
                <Suspense fallback={<Loader />}>
                  <History />
                </Suspense>
              ),
            },
            {
              path: "billing",
              element: (
                <Suspense fallback={<Loader />}>
                  <Billing />
                </Suspense>
              ),
            },
            {
              path: "content/:slugName",
              element: (
                <Suspense fallback={<Loader />}>
                  <Content />
                </Suspense>
              ),
            },
            { path: "*", element: <NotFound /> },
          ],
        },
        { path: "*", element: <NotFound /> },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const userData = await fetchUserData(token);
          if (userData) {
            dispatch(restoreUserData({ token, userInfo: userData?.data }));
          }

          const { aiResponses, totalWords } = await fetchAiResponseData(token);
          dispatch(setAiData({ aiResponses, totalWords }));
        } catch (err) {
          setError("Error fetching data: " + err);
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [dispatch, token]);

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;

  return <RouterProvider router={router} />;
}

export default App;
