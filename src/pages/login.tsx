import React from "react"
import { useRouter } from "next/router"
import { Button, Heading, Flex, Box, Input, Text } from "@chakra-ui/react"
import { supabase } from "lib/supabase"
import { useUser } from "@supabase/supabase-auth-helpers/react"

const Auth: React.FC = () => {
  const user = useUser()
  const { replace } = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | undefined>()
  const [success, setSuccess] = React.useState(false)
  const hasUser = !!user?.user

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError("You forgot the one thing you needed")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signIn({ email })
      if (error) throw error
      setSuccess(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setEmail(event.target.value)
  }

  React.useEffect(() => {
    if (hasUser) {
      replace("/profile")
    }
  }, [replace, hasUser])

  return (
    <Flex flexDirection="column" mt={24} width="360px">
      {success && (
        <Box bg="green.300" p={4} borderRadius={10} mb={8}>
          <Text color="green.900">
            Sent an email to {email}. You can close this tab now. If you
            don&apos;t see it, check your spam folder.
          </Text>
        </Box>
      )}
      <Heading>Login</Heading>
      <form onSubmit={handleLogin}>
        <Box mt={5}>
          <label htmlFor="app-login">
            {error ? (
              <Text color="red.500" sx={{ translateY: "-100%" }}>
                {error}
              </Text>
            ) : (
              <Text color="#868686">Email</Text>
            )}
          </label>
          <Input
            sx={{
              borderColor: "#b5b5b5",
            }}
            id="app-login"
            type="email"
            placeholder="satoshin@gmx.com"
            value={email}
            onChange={handleInputChange}
          />
        </Box>
        <Flex mt={3} flexDirection={["column", "row"]}>
          <Button
            onClick={handleLogin}
            type="submit"
            colorScheme="yellow"
            disabled={loading}
          >
            {loading ? "Sending" : "Send magic link"}
          </Button>
        </Flex>
      </form>
    </Flex>
  )
}

export async function getServerSideProps({ req }) {
  try {
    // const { user: auth } = await supabase.auth.api.getUserByCookie(req)

    // if (auth.email) {
    //   return {
    //     redirect: {
    //       destination: "/profile",
    //       permanent: false,
    //     },
    //   }
    // }

    return { props: {} }
  } catch (err) {
    console.log(err)
    return { props: { error: err.message, user: {} } }
  }
}

export default Auth
