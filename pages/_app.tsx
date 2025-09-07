import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import Head from 'next/head'
import { Analytics } from '@vercel/analytics/react'
import { LoadingProvider } from '../src/contexts/LoadingContext'
import LoadingBar from '../src/components/ui/LoadingBar'
import '@/styles/globals.css'

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <LoadingProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#FF7A00" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="GatorEx" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/app-icon.png" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <LoadingBar />
        <Component {...pageProps} />
        <Analytics />
      </LoadingProvider>
    </SessionProvider>
  )
}