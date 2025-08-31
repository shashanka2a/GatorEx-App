import { GetServerSideProps } from 'next';

export default function HomePage() {
  return null; // This page will always redirect
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Always redirect to /buy - middleware will handle auth
  return {
    redirect: {
      destination: '/buy',
      permanent: false,
    },
  };
};