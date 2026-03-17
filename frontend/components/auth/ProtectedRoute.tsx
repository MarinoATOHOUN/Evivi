
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();

    // CRITICAL: Return Navigate immediately without rendering children
    // This prevents any child components from mounting and making API calls
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Only render children if authenticated
    return <>{children}</>;
};

export default ProtectedRoute;
