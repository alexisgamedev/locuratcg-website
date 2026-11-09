// Opens Culqi Checkout (v4) in the browser and resolves with a card token.
// Docs: https://docs.culqi.com/es/documentacion/checkout/v4/culqi-checkout
const CULQI_SCRIPT = 'https://checkout.culqi.com/js/v4'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Culqi?: any
    culqi?: () => void
  }
}

let loading: Promise<any> | null = null

function loadCulqi(): Promise<any> {
  if (window.Culqi) return Promise.resolve(window.Culqi)
  loading ||= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = CULQI_SCRIPT
    s.async = true
    s.onload = () => resolve(window.Culqi)
    s.onerror = () => {
      loading = null
      reject(new Error("Couldn't open the Culqi checkout. Check your connection and try again."))
    }
    document.head.appendChild(s)
  })
  return loading
}

export async function openCulqiCheckout(opts: {
  publicKey: string
  amountCents: number
  title: string
  description: string
}): Promise<string> {
  const Culqi = await loadCulqi()
  Culqi.publicKey = opts.publicKey
  Culqi.settings({ title: opts.title, currency: 'PEN', amount: opts.amountCents, description: opts.description })
  Culqi.options({
    installments: false,
    lang: 'es',
    paymentMethods: {
      tarjeta: true,
      yape: false,
      bancaMovil: false,
      agente: false,
      billetera: false,
      cuotealo: false,
    },
  })
  return new Promise((resolve, reject) => {
    window.culqi = () => {
      if (Culqi.token?.id) {
        resolve(Culqi.token.id)
        return
      }
      if (Culqi.error) reject(new Error(Culqi.error.user_message || "The card details weren't accepted."))
    }
    Culqi.open()
  })
}
