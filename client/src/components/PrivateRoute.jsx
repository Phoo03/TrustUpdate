import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../App';

/**
 * PrivateRoute — redirects unauthenticated users to /login.
 * @param {{ children: React.ReactNode }} props
 */
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
