import { Navigate, useLocation } from 'react-router-dom';
import { useErp } from '../hooks/useErp';
import { isRouteAllowedForRole } from '../services/rolePermissions';
import AccessDeniedPage from '../features/auth/AccessDeniedPage';

/**
 * Route protection guard checking authentication and role authorization
 */
export function ProtectedRoute({ children, requiredPath }) {
  const { isAuthenticated, currentUser } = useErp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  const pathToCheck = requiredPath || location.pathname;
  const isAllowed = isRouteAllowedForRole(currentUser?.role, pathToCheck);

  if (!isAllowed) {
    return <AccessDeniedPage />;
  }

  return children;
}

export default ProtectedRoute;
