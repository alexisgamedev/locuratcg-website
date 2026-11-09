import './env.server'
// Culqi (Peru) card charges: https://docs.culqi.com
// The browser turns the card into a token with Culqi Checkout; we charge it here with the secret key.

export function culqiConfigured() {
  return Boolean(process.env.CULQI_PUBLIC_KEY && process.env.CULQI_SECRET_KEY)
}

export async function createCharge(opts: {
  tokenId: string
  amountCents: number
  email: string
  description: string
}) {
  const res = await fetch('https://api.culqi.com/v2/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount: opts.amountCents,
      currency_code: 'PEN',
      email: opts.email,
      source_id: opts.tokenId,
      description: opts.description.slice(0, 80),
    }),
  })
  const body = (await res.json().catch(() => ({}))) as {
    id?: string
    outcome?: { type?: string; user_message?: string }
    user_message?: string
    merchant_message?: string
  }
  if (!res.ok || !body.id) {
    throw new Error(body.user_message || body.merchant_message || 'The payment was declined.')
  }
  return { id: body.id }
}
