import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { CampusSchema } from "@edusync/shared";

const authOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || "edusync-client",
      clientSecret: process.env.KEYCLOAK_SECRET || "edusync-secret",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/nexus-federation",
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    onboarding: "/onboarding",
  },
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (account && profile) {
        // Map the campus from Keycloak/OIDC institutional attributes
        const userCampus = profile.campus || profile.institutional_node;
        const validatedCampus = CampusSchema.safeParse(userCampus);
        
        token.campus = validatedCampus.success ? validatedCampus.data : 'IIT_JAMMU'; // Fallback for POC
        token.uid = profile.sub;
        token.roles = profile.resource_access?.['edusync-client']?.roles || ['student'];
        token.verifiedInstitutionalId = profile.email_verified || false;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.uid = token.uid;
        session.user.campus = token.campus;
        session.user.roles = token.roles;
        session.user.verifiedInstitutionalId = token.verifiedInstitutionalId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_nextauth_secret_for_dev",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
