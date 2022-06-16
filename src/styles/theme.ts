import { extendTheme } from "@chakra-ui/react"

const Input = {
  baseStyle: {
    field: {
      color: "white",
      _placeholder: {
        color: "#b5b5b5",
      },
    },
  },
}

const theme = extendTheme({
  styles: {
    global: {
      body: {
        color: "white",
      },
    },
  },
  fonts: {
    heading: `'Chivo', system-ui, sans-serif`,
    body: `'Chivo', system-ui, sans-serif`,
  },
  components: { Input },
})

export default theme
