import React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import Head from "next/head"

import { UserProvider } from "@supabase/supabase-auth-helpers/react"
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs"
import Layout from "components/Layout"
import theme from "styles/theme"

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>LN Uptime</title>
        <meta property="og:title" content="LN Uptime" />
        <meta
          property="og:description"
          content="Get email alerts when your lightning node goes offline"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="https://lnuptime.com/ogimg.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="600" />
      </Head>
      <UserProvider supabaseClient={supabaseClient}>
        <ChakraProvider theme={theme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </UserProvider>
    </>
  )
}

export default MyApp
