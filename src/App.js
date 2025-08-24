import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext"; 
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import Layout from "./components/layout/Layout";
import { protectedRoutes } from "./config/routes";

import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/error/NotFoundPage";
import BoothDetailPage from "./pages/booths/BoothDetailPage";
import VerifyPage from "./pages/auth/VerifyPage";

function App() {
  return (
    <AuthProvider>
      <SocketProvider> 
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/booths/:id"
            element={
              <PublicRoute>
                <BoothDetailPage />
              </PublicRoute>
            }
          />

          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/auth/verify"
            element={
              <PublicRoute>
                <VerifyPage />
              </PublicRoute>
            }
          />

          <Route
            path="/auth/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />

            {protectedRoutes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={
                  route.roles && route.roles.length > 0 ? (
                    <ProtectedRoute roles={route.roles}>
                      {route.element}
                    </ProtectedRoute>
                  ) : (
                    route.element
                  )
                }
              />
            ))}
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;