import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/roleUtils';
import { Alert } from '@mui/material';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
}) => {
  const { user } = useAuth();

  if (!hasPermission(user?.role, permission)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Alert severity="warning">
        You don't have permission to access this feature.
      </Alert>
    );
  }

  return <>{children}</>;
};
