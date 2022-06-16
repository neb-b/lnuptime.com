import React from "react"
import axios from "axios"
import {
  Box,
  Flex,
  Text,
  Textarea,
  Button,
  Input,
  Heading,
} from "@chakra-ui/react"
import { supabase } from "lib/supabase"

type Props = {
  user: User
  error?: string
}

const CONNECTION_STRING_REGEX = /^(.*?)@(.*?)(?::([0-9]+))?$/

const Profile: React.FC<Props> = ({ user, error }) => {
  const [updateError, setUpdateError] = React.useState<string | undefined>()
  const [updating, setUpdating] = React.useState(false)
  const [connectionString, setConnectionString] = React.useState<
    string | undefined
  >(user.connection_string)
  const [success, setSuccess] = React.useState(false)

  const saveUser = async () => {
    setUpdateError(undefined)

    try {
      setUpdating(true)

      const vals = connectionString.match(CONNECTION_STRING_REGEX)
      if (!vals) {
        setUpdateError("Bad connection string")
        return
      }

      const pubkey = vals[1]
      await supabase
        .from("profiles")
        .update({ connection_string: connectionString, pubkey })
        .match({ email: user.email })

      setSuccess(true)
    } catch (e) {
      setUpdateError("Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  const sendEmail = async () => {
    try {
      axios.post(
        `/api/email?pubkey=0364a7ebecfbae8039fe9c2b88b6ffd3e09cea36dc113ec993cca69c4e5bb8bf21`
      )
    } catch (e) {
      console.log("error", error)
    }
  }

  return (
    <Box mt={10} w={["100%", 400]} p={[4, 0]}>
      {error && (
        <Box bg="red.100" p={4} borderRadius={10} mb={8}>
          <Text color="red.500">{error}</Text>
        </Box>
      )}

      {success && (
        <Box bg="green.100" p={4} borderRadius={10} mb={8}>
          <Text color="green.700">
            Connection string saved successfully. We are now monitoring your
            node.
          </Text>
        </Box>
      )}
      <Heading mt={8}>Your Profile</Heading>

      <Box mt={6}>
        <label htmlFor="email">
          <Text color="#868686">Email</Text>
        </label>
        <Input id="email" disabled value={user.email} />
      </Box>
      <Box mt={4}>
        <label htmlFor="connection_string">
          <Text color="#868686">Lightning node connection string</Text>
        </label>
        <Textarea
          sx={{ height: 150, borderColor: "#868686" }}
          placeholder="pubkey@host:port"
          id="connection_string"
          value={connectionString}
          onChange={(e) => setConnectionString(e.target.value)}
        />
      </Box>

      <Button
        mt="4"
        colorScheme="yellow"
        disabled={updating || connectionString === user.connection_string}
        onClick={saveUser}
      >
        {updating ? "Saving" : "Save"}
      </Button>

      {updateError && (
        <Box bg="red.100" p={4} borderRadius={10} mt={4}>
          <Text color="red.500">{updateError}</Text>
        </Box>
      )}

      {/* <Box>
        <Heading>Test Email</Heading>
        <Button onClick={sendEmail}>Send</Button>
      </Box> */}
    </Box>
  )
}

export async function getServerSideProps({ req }) {
  try {
    const { user: auth } = await supabase.auth.api.getUserByCookie(req)
    let { data: user, error: userError } = await supabase
      .from("profiles")
      .select(`email, connection_string`)
      .eq("id", auth.id)
      .single()

    if (userError && userError.details.includes("Results contain 0 rows")) {
      let { data: newUserResponse, error: newUserError } = await supabase
        .from("profiles")
        .insert({
          id: auth.id,
          email: auth.email,
        })

      if (newUserError) {
        throw newUserError
      }

      const newUser = newUserResponse[0]
      return { props: { user: newUser } }
    }

    return { props: { user } }
  } catch (err) {
    console.log(err)
    return { props: { error: err.message, user: {} } }
  }
}

export default Profile
