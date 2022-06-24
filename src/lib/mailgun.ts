import formData from "form-data"
import Mailgun from "mailgun.js"
import log from "log"

const mailgun = new Mailgun(formData)
const client = mailgun.client({
  username: process.env.MAILGUN_USERNAME,
  key: process.env.MAILGUN_API_KEY,
})

export const sendEmail = async ({ to, subject, text }) => {
  if (to !== process.env.EMAIL && process.env.NODE_ENV !== "production") {
    log.info("ignoring non-whitelisted email")
    return
  }

  try {
    const domainsList = await client.domains.list()
    const domain = domainsList[0].name

    const messageData = {
      from: `LN Uptime <alert@${domain}>`,
      to,
      subject,
      text,
    }

    const emailRes = await client.messages.create(domain, messageData)
    if (emailRes.status !== 200) {
      log.info("email failed to send")
    }
    log.info("email sent")
  } catch (e) {
    log.info("email failure:", e)
  }
}

export const sendSuccessEmail = async (to: string) => {
  log.info("sending success email")
  await sendEmail({
    to,
    subject: "LN Uptime - Your node is back online",
    text: "Your lightning node is back online. Nice work.",
  })
}

export const sendFailureEmail = async (to: string) => {
  console.log("sending failure email")
  await sendEmail({
    to,
    subject: "LN Uptime - Your node is offline",
    text: "We were unable to contact your lightning node. You should check to make sure it's still online.",
  })
}
