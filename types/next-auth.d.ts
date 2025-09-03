import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      ufEmailVerified?: boolean;
      profileCompleted?: boolean;
      termsAccepted?: boolean;
      privacyAccepted?: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    ufEmailVerified?: boolean;
    profileCompleted?: boolean;
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    ufEmailVerified?: boolean;
    profileCompleted?: boolean;
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
  }
}