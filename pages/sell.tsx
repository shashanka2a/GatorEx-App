import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getSessionFromNextRequest } from '../src/lib/auth/session';
import { prisma } from '../src/lib/db/prisma';

export default function SellPage() {
  return (
    <>
      <Head>
        <title>Sell - GatorEx</title>
        <meta name="description" content="List your item for sale to fellow UF students" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sell Feature Coming Soon
          </h1>
          <p className="text-gray-600 mb-6">
            We're building the guided selling wizard. For now, you can browse items on the buy page.
          </p>
          <Link
            href="/buy"
            className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse Items
          </Link>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const session = getSessionFromNextRequest(req as any);
    
    if (!session) {
      return {
        redirect: {
          destination: '/verify',
          permanent: false,
        },
      };
    }

    // Check if user is UF verified
    const user = await prisma.user.findUnique({
      where: { email: session.email },
      select: { ufEmailVerified: true, profileCompleted: true }
    });

    if (!user?.ufEmailVerified) {
      return {
        redirect: {
          destination: '/verify',
          permanent: false,
        },
      };
    }

    if (!user?.profileCompleted) {
      return {
        redirect: {
          destination: '/complete-profile',
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error in sell page:', error);
    return {
      redirect: {
        destination: '/verify',
        permanent: false,
      },
    };
  }
};