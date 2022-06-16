import React from "react"
import Link from "next/link"
import { Button, Heading, Flex, Box, Input, Text } from "@chakra-ui/react"
import { supabase } from "lib/supabase"

const Auth: React.FC = () => {
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | undefined>()

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

  return (
    <Flex flexDirection="column" mt={24} width="360px">
      <Heading>Setup your profile</Heading>
      <form onSubmit={handleLogin}>
        <Box mt={5}>
          <label htmlFor="app-login">
            {error ? (
              <Text color="red.500" sx={{ translateY: "-100%" }}>
                {error}
              </Text>
            ) : (
              "Email"
            )}
          </label>
          <Input
            id="app-login"
            type="email"
            placeholder="satoshin@gmx.com"
            value={email}
            onChange={handleInputChange}
          />
        </Box>
        <Button
          onClick={handleLogin}
          type="submit"
          colorScheme="teal"
          disabled={loading}
        >
          {loading ? "Loading" : "Send magic link"}
        </Button>
      </form>
    </Flex>
  )
}

export default Auth
