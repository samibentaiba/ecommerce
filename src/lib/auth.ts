import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              permissions: true,
            },
          });

          if (!user) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          // Check 2FA if enabled
          if (user.twoFactorEnabled) {
            if (!credentials.twoFactorCode) {
              throw new Error("2FA_REQUIRED");
            }

            // Verify 2FA code (you'll need to implement this)
            const isValid2FA = await verifyTwoFactorCode(
              user.id,
              credentials.twoFactorCode
            );
            if (!isValid2FA) {
              return null;
            }
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            parentId: user.parentId,
            twoFactorEnabled: user.twoFactorEnabled || false,
            permissions: user.permissions,
          };
        } catch (error) {
          if (error instanceof Error && error.message === "2FA_REQUIRED") {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.parentId = user.parentId;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.parentId = token.parentId as string | null;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
        session.user.permissions = token.permissions as any[];
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/signin",
    error: "/admin/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to verify 2FA code (you'll need to implement this)
async function verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
  // Implement your 2FA verification logic here
  // This is a placeholder - you'll need to implement the actual TOTP verification
  return true;
}

// Helper function to check permissions
export function hasPermission(
  user: any,
  resource: string,
  action: "view" | "create" | "edit" | "delete"
): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  const permission = user.permissions.find((p: any) => p.resource === resource);
  if (!permission) {
    return false;
  }

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
