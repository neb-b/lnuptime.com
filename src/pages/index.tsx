import React from "react"
import { Button, Heading, Link, Flex, Box, Text } from "@chakra-ui/react"

const Index: React.FC = () => {
  return (
    <Flex flexDirection="column" mt={24} width="600px" px={[6, 4, 0]}>
      <Heading fontSize={[48, 72]}>Is Your Lightning Node Running?</Heading>
      <Text mt={[4, 8]} fontSize={[24, 32]}>
        Get an email alert when your lightning node goes offline
      </Text>

      <Box mt={8}>
        <Link href="/login" sx={{ _hover: { textDecoration: "none" } }}>
          <Button colorScheme="yellow" fontSize={24} p={8}>
            Sign Up
          </Button>
        </Link>
      </Box>
    </Flex>
  )
}

export default Index
