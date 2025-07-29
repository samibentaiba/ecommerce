import React from "react";
import { ResourceType } from "@prisma/client";
import { createPermissionChecker } from "@/lib/permissions";
import { Session } from "next-auth";

interface PermissionGuardProps {
  user: Session["user"] | null;
  resource: ResourceType;
  action: "view" | "create" | "edit" | "delete";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({
  user,
  resource,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  if (!user) {
    return <>{fallback}</>;
  }

  const permissionChecker = createPermissionChecker(user);
  
  const hasPermission = permissionChecker.hasPermission(resource, action);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Higher-order component for permission checking
export function withPermission<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  resource: ResourceType,
  action: "view" | "create" | "edit" | "delete"
) {
  return function PermissionWrappedComponent(props: T & { user: Session["user"] | null }) {
    const { user, ...restProps } = props;
    
    return (
      <PermissionGuard user={user} resource={resource} action={action}>
        <WrappedComponent {...(restProps as T)} />
      </PermissionGuard>
    );
  };
}

// Hook for permission checking
export function usePermissions(user: Session["user"] | null) {
  if (!user) {
    return {
      canView: () => false,
      canCreate: () => false,
      canEdit: () => false,
      canDelete: () => false,
      hasPermission: () => false,
      isSuperUser: () => false,
      isSubUser: () => false,
      getAccessibleResources: () => [],
      getResourcePermissions: () => ({ canView: false, canCreate: false, canEdit: false, canDelete: false }),
    };
  }

  const permissionChecker = createPermissionChecker(user);
  
  return {
    canView: (resource: ResourceType) => permissionChecker.canView(resource),
    canCreate: (resource: ResourceType) => permissionChecker.canCreate(resource),
    canEdit: (resource: ResourceType) => permissionChecker.canEdit(resource),
    canDelete: (resource: ResourceType) => permissionChecker.canDelete(resource),
    hasPermission: (resource: ResourceType, action: "view" | "create" | "edit" | "delete") => 
      permissionChecker.hasPermission(resource, action),
    isSuperUser: () => permissionChecker.isSuperUser(),
    isSubUser: () => permissionChecker.isSubUser(),
    getAccessibleResources: () => permissionChecker.getAccessibleResources(),
    getResourcePermissions: (resource: ResourceType) => permissionChecker.getResourcePermissions(resource),
  };
} 