import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SellChatWizard from '../src/components/sell/SellChatWizard';
import { prisma } from '../src/lib/db/prisma';

interface SellPageProps {
  userStats: {
    dailyListings: number;
    totalLiveListings: number;
    canCreateListing: boolean;
    rateLimitMessage?: string;
  };
}

export default function SellPage({ userStats }: SellPageProps) {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Sell - GatorEx</title>
        <meta name="description" content="Create your listing with our guided chat wizard" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <SellChatWizard 
          userStats={userStats}
          userId={session?.user?.id}
        />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.id) {
      return {
        redirect: {
          destination: '/login-otp',
          permanent: false,
        },
      };
    }

    // Check if user is UF verified and profile completed
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        ufEmailVerified: true, 
        profileCompleted: true,
        id: true
      }
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

    // Get user's listing stats for rate limiting
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [dailyListings, totalLiveListings] = await Promise.all([
      prisma.listing.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.listing.count({
        where: {
          userId: user.id,
          status: 'PUBLISHED'
        }
      })
    ]);

    const canCreateListing = dailyListings < 3 && totalLiveListings < 10;
    let rateLimitMessage;

    if (dailyListings >= 3) {
      rateLimitMessage = "You've reached your daily limit of 3 new listings. Try again tomorrow!";
    } else if (totalLiveListings >= 10) {
      rateLimitMessage = "You have 10 active listings (the maximum). Please wait for some to expire or delete old ones.";
    }

    return {
      props: {
        userStats: {
          dailyListings,
          totalLiveListings,
          canCreateListing,
          rateLimitMessage
        }
      },
    };
  } catch (error) {
    console.error('Error in sell page:', error);
    return {
      redirect: {
        destination: '/login-otp',
        permanent: false,
      },
    };
  }
};