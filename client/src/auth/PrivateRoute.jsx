import { Navigate, useLocation } from 'react-router-dom';
import auth from './auth-helper';

export default function PrivateRoute({ children, sellerOnly = false }) {
  const location = useLocation();

  const authData = auth.isAuthenticated();

  if (!authData) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (sellerOnly && !authData.user?.seller) {
    return <Navigate to="/" replace />;
  }

  return children;
}
