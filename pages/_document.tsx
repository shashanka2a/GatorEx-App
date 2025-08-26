import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="GatorEx - Your UF marketplace for buying and selling items with fellow Gators" />
        <meta name="keywords" content="UF, University of Florida, marketplace, buy, sell, students, Gators" />
        <meta name="author" content="GatorEx Team" />
        <meta property="og:title" content="GatorEx - UF Student Marketplace" />
        <meta property="og:description" content="Your UF marketplace for buying and selling items with fellow Gators" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GatorEx - UF Student Marketplace" />
        <meta name="twitter:description" content="Your UF marketplace for buying and selling items with fellow Gators" />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}