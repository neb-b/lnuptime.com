import axios from "axios"
import { supabase } from "lib/supabase"
import { sendSuccessEmail, sendFailureEmail } from "lib/mailgun"
import log from "log"

const api = axios.create({
  baseURL: process.env.VOLTAGE_API_URL,
  timeout: 10000,
  headers: {
    "Grpc-Metadata-Macaroon": process.env.ADMIN_MACAROON_HEX,
  },
})

export default async function handler(req, res) {
  // const pingAuth = req.headers["x-ping-auth"]
  // if (
  //   process.env.NODE_ENV === "production" &&
  //   pingAuth !== process.env.PING_AUTH
  // ) {
  //   res.status(401).json({ error: "unauthorized" })
  //   return
  // }
  //

  try {
    const { data: userNodes, error: userNodesError } = await supabase
      .from("profiles")
      .select("id, email, connection_string, pubkey")

    if (userNodesError) {
      log.error("error getting user nodes", userNodesError)
      res.status(500).json({ status: "error", error: userNodesError })
      return
    }

    let peers = []
    try {
      log.info("fetching ln peers")
      const { data } = await api.get(`/v1/peers`)
      peers = data.peers
      log.info("connected to ", peers.length, "peers")
    } catch (e) {
      log.error("failed to fetch peers: ", e.message)
      res.status(500).json({ status: "error", error: e.message })
      return
    }

    const peerMap = peers.reduce((acc, peer) => {
      acc[peer.pub_key] = true
      return acc
    }, {})

    console.log("peerMap", peerMap)
    let count = 0
    const updateCheck = () => {
      count++

      if (count === userNodes.length) {
        console.log("return")
        res.status(200).json({ status: "ok" })
      }
    }

    userNodes.forEach(async (node) => {
      const userConnectionStatus = peerMap[node.pubkey] ? 1 : 0
      // TODO
      // perform a single read/write to supabase to update all node's connection status at once
      const { data: previousStatusData, error: previousStatusError } =
        await supabase
          .from("connections")
          .select("status")
          .match({ user_id: node.id })
          .order("id", { ascending: false })
          .limit(1)
          .single()

      if (previousStatusError) {
        log.info("previous status error: ", previousStatusError)
        if (userConnectionStatus) {
          log.info(
            "previous status error, but user is online, saving connection status"
          )
          await supabase.from("connections").insert({
            user_id: node.id,
            status: 1,
          })
          return
        }

        // user has probably never had a connection status
        // try to connect and add their first entry
        if (previousStatusError.details.includes("Results contain 0 rows")) {
          try {
            // Ideally this connection should happen when they type in their connection_string
            // Then we can validate that they are connected immediately instead of after a delay
            await api.post("/v1/peers", {
              addr: {
                pubkey: node.pubkey,
                host: node.connection_string.split("@")[1],
              },
            })
            log.info("connected to node for first time")
            await supabase.from("connections").insert({
              user_id: node.id,
              status: 1,
            })
            return
          } catch (e) {
            log.error("failed to connect for first time: ", e.message)
            await supabase.from("connections").insert({
              user_id: node.id,
              status: 0,
            })
            return
          }
        } else {
          log.error("error getting previous status", previousStatusError)
          // error getting users previous status
          // not sure
          updateCheck()
          return
        }
      }

      const { status: previousStatus } = previousStatusData
      if (previousStatus && previousStatus === userConnectionStatus) {
        // user has not changed connection status
        // ignore until there is something new
        updateCheck()
        return
      }

      // user is currently not connected
      // try to reconnect to see if they are online
      if (userConnectionStatus === 0) {
        try {
          log.info("trying to reconnect")
          await api.post("/v1/peers", {
            addr: {
              pubkey: node.pubkey,
              host: node.connection_string.split("@")[1],
            },
          })

          // user previously disconnected, and is now connected
          if (previousStatus === 0) {
            const { error: setReconnectionStatusError } = await supabase
              .from("connections")
              .insert({
                status: 1,
                user_id: node.id,
              })
            if (!setReconnectionStatusError) {
              log.info("success reconnecting")
              await sendSuccessEmail(node.email)
            }
          } else {
            // user wasn't in listpeers but we were able to reconnect
            // user is online so nothing to do here
          }

          updateCheck()
          return
        } catch (e) {
          log.info("unable to reconnect")
          if (previousStatus === 0) {
            log.info("node offline: ", node.pubkey)
            // user is still offline, and has already been alerted
            updateCheck()
            return
          }

          // unable to reconnect to user
          // update connections status and send failure email alerting user
          const { error: updateError } = await supabase
            .from("connections")
            .insert({
              user_id: node.id,
              status: 0,
            })

          if (!updateError) {
            log.info("failed to connect - sending email")
            await sendFailureEmail(node.email)
          }
        }

        updateCheck()
        return
      } else {
        log.info("node is online")

        if (previousStatus !== 1) {
          await supabase.from("connections").insert({
            user_id: node.id,
            status: 1,
          })
          sendSuccessEmail(node.email)
        }
        updateCheck()
      }
    })
  } catch (e) {
    log.error("error: ", e.message)
    res.status(500).json({ status: "error", error: e.message })
    return
  }
}
