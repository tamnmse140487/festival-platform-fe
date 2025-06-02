import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

export const renderProtectedRoutes = (routes) => {
  return routes.map((route, index) => (
    <Route
      key={index}
      path={route.path}
      element={
        route.roles && route.roles.length > 0 ? (
          <ProtectedRoute roles={route.roles}>
            {route.element}
          </ProtectedRoute>
        ) : route.element
      }
    />
  ));
};