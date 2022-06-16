import React from "react"
import { useRouter } from "next/router"
import { Box, Text, Button, Link, Flex } from "@chakra-ui/react"
import { useUser } from "@supabase/supabase-auth-helpers/react"
import Logo from "./Logo"

type Props = {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  // @ts-ignore
  const { loading, user, accessToken } = useUser()
  const router = useRouter()
  const isProfilePage = router.pathname === "/profile"
  const isHomePage = router.pathname === "/"

  const sx = {
    minHeight: "100vh",
  }
  const bgSx = isHomePage
    ? {
        ...sx,
        background: `linear-gradient(to bottom, #000000, #222)`,
      }
    : {
        ...sx,
        background: "#171717",
      }

  return (
    <Box sx={bgSx}>
      <Box
        sx={{
          borderBottom: isHomePage ? "none" : "1px solid #404040",
          px: 6,
          py: 4,
          height: 82,
        }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Link href="/">
          <Logo />
        </Link>

        {!loading && (
          <>
            {isProfilePage && user && (
              <Link color="yellow.400" fontSize={18} href="/api/auth/logout">
                Logout
              </Link>
            )}
            {!isProfilePage && accessToken && (
              <Link
                colorScheme="yellow"
                href="/profile"
                fontSize={18}
                sx={{ color: "yellow.400" }}
              >
                Your Profile
              </Link>
            )}
            {!isProfilePage && !user && (
              <Link href="/login" fontSize={18} sx={{ color: "yellow.400" }}>
                Login
              </Link>
            )}
          </>
        )}
      </Box>
      <Box
        pb={[12, 0]}
        display="flex"
        justifyContent="center"
        sx={{ minHeight: "calc(100vh - 82px)" }}
      >
        {children}
      </Box>
      <Box
        sx={{ borderTop: "1px solid #404040", px: 6, py: 4, color: "gray.400" }}
      >
        Created by{" "}
        <Link color="#1d87ec" href="https://twitter.com/AsherHopp">
          @AsherHopp
        </Link>{" "}
        and{" "}
        <Link color="#1d87ec" href="https://twitter.com/neb_b">
          @neb_b
        </Link>
      </Box>
    </Box>
  )
}

export default Layout
