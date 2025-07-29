import { ResourceType } from "@prisma/client";
import { Session } from "next-auth";

export interface UserPermission {
  id: string;
  userId: string;
  resource: ResourceType;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export class PermissionChecker {
  private user: Session["user"];

  constructor(user: Session["user"]) {
    this.user = user;
  }

  // Check if user is a super user (no parentId)
  isSuperUser(): boolean {
    return !this.user.parentId;
  }

  // Check if user is a sub-user
  isSubUser(): boolean {
    return !!this.user.parentId;
  }

  // Check if user has permission for a specific resource and action
  hasPermission(
    resource: ResourceType,
    action: "view" | "create" | "edit" | "delete"
  ): boolean {
    // Super users have all permissions
    if (this.isSuperUser()) {
      return true;
    }

    // Find permission for the resource
    const permission = this.user.permissions?.find(
      (p) => p.resource === resource
    );
    if (!permission) {
      return false;
    }

    // Check specific action
    switch (action) {
      case "view":
        return permission.canView;
      case "create":
        return permission.canCreate;
      case "edit":
        return permission.canEdit;
      case "delete":
        return permission.canDelete;
      default:
        return false;
    }
  }

  // Check if user can view a resource
  canView(resource: ResourceType): boolean {
    return this.hasPermission(resource, "view");
  }

  // Check if user can create a resource
  canCreate(resource: ResourceType): boolean {
    return this.hasPermission(resource, "create");
  }

  // Check if user can edit a resource
  canEdit(resource: ResourceType): boolean {
    return this.hasPermission(resource, "edit");
  }

  // Check if user can delete a resource
  canDelete(resource: ResourceType): boolean {
    return this.hasPermission(resource, "delete");
  }

  // Get all resources the user has any access to
  getAccessibleResources(): ResourceType[] {
    if (this.isSuperUser()) {
      return Object.values(ResourceType);
    }

    return (
      this.user.permissions
        ?.filter((p) => p.canView || p.canCreate || p.canEdit || p.canDelete)
        .map((p) => p.resource as ResourceType) || []
    );
  }

  // Get permissions summary for a resource
  getResourcePermissions(resource: ResourceType): {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  } {
    if (this.isSuperUser()) {
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      };
    }

    const permission = this.user.permissions?.find(
      (p) => p.resource === resource
    );
    return permission
      ? {
          canView: permission.canView,
          canCreate: permission.canCreate,
          canEdit: permission.canEdit,
          canDelete: permission.canDelete,
        }
      : {
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
        };
  }
}

// Helper function to create permission checker
export function createPermissionChecker(
  user: Session["user"]
): PermissionChecker {
  return new PermissionChecker(user);
}

// Resource type labels for UI
export const RESOURCE_LABELS: Record<ResourceType, string> = {
  ORDER: "Orders",
  PRODUCT: "Products",
  LANDING_PAGE: "Landing Pages",
  PRODUCT_PAGE: "Product Pages",
  CART: "Cart",
  WISHLIST: "Wishlist",
  SETTINGS: "Settings",
};

// Permission action labels
export const PERMISSION_LABELS = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};
