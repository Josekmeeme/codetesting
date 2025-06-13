import axios from 'axios'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { amount, currency = 'USD' } = req.body

    try {
      // Step 1: Get OAuth 2.0 access token
      const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64')

      const { data: tokenRes } = await axios.post(
        'https://api-m.paypal.com/v1/oauth2/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      const accessToken = tokenRes.access_token

      // Step 2: Create Order
      const { data: order } = await axios.post(
        'https://api-m.paypal.com/v2/checkout/orders',
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount,
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return res.status(200).json({ id: order.id }) // Send Order ID to frontend
    } catch (error) {
      console.error('PayPal Error:', error.response?.data || error.message)
      return res.status(500).json({ error: 'Failed to create PayPal order' })
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
} 
