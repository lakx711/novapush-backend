import Twilio from 'twilio'

let client

export function getSmsClient() {
  if (client) return client
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) throw new Error('Twilio not configured')
  client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  return client
}

export async function sendSMS({ to, body, statusCallback }) {
  const c = getSmsClient()
  const from = process.env.TWILIO_FROM
  if (!from) throw new Error('TWILIO_FROM not set')
  const createParams = { from, to, body }
  if (statusCallback) createParams.statusCallback = statusCallback
  const msg = await c.messages.create(createParams)
  return { sid: msg.sid }
}
