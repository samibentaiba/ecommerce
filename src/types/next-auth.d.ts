import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      parentId: string | null;
      twoFactorEnabled: boolean;
      permissions: Array<{
        id: string;
        resource: string;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
      }>;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    parentId: string | null;
    twoFactorEnabled: boolean;
    permissions: Array<{
      id: string;
      resource: string;
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    parentId: string | null;
    twoFactorEnabled: boolean;
    permissions: Array<{
      id: string;
      resource: string;
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }>;
  }
}
