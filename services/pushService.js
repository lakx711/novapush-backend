import webpush from 'web-push'

let configured = false

function ensureConfigured() {
  if (configured) return
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) throw new Error('VAPID keys not set')
  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  configured = true
}

export async function sendPush({ subscription, payload }) {
  ensureConfigured()
  const result = await webpush.sendNotification(subscription, JSON.stringify(payload))
  return { statusCode: result.statusCode }
}
