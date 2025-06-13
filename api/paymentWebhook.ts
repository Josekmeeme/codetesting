import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      Body: {
        stkCallback: {
          MerchantRequestID,
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          CallbackMetadata,
        },
      },
    } = req.body

    const paymentStatus = ResultCode === 0 ? 'SUCCESS' : 'FAILED'
    const metadata = CallbackMetadata?.Item?.reduce((acc: any, item: any) => {
      acc[item.Name] = item.Value
      return acc
    }, {}) || {}

    const paymentDetails = {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      Amount: metadata.Amount || 0,
      MpesaReceiptNumber: metadata.MpesaReceiptNumber || null,
      PhoneNumber: metadata.PhoneNumber || null,
      TransactionDate: metadata.TransactionDate || null,
      paymentStatus,
    }

    // TODO: Save `paymentDetails` to your DB for reference
    console.log('Received M-PESA Callback:', paymentDetails)

    // Acknowledge Safaricom immediately
    return res.status(200).json({ ResponseCode: '00000000', ResponseDesc: 'Success' })
  } catch (error: any) {
    console.error('M-PESA Webhook Error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
} 
