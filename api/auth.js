import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import db from '@/lib/db' // Prisma DB helper (adjust path if needed)

const JWT_SECRET = process.env.JWT_SECRET || 'smartkidstories_secret'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action, email, password, name, role } = req.body

    if (!action || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (action === 'register') {
      try {
        const existing = await db.user.findUnique({ where: { email } })
        if (existing) return res.status(409).json({ error: 'Email already registered' })

        const hashed = await bcrypt.hash(password, 10)

        const user = await db.user.create({
          data: {
            email,
            password: hashed,
            name: name || 'User',
            role: role || 'user', // 'admin', 'user', 'promoter'
          },
        })

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

        return res.status(201).json({ token, user })
      } catch (err) {
        console.error('Registration error:', err)
        return res.status(500).json({ error: 'Registration failed' })
      }
    }

    if (action === 'login') {
      try {
        const user = await db.user.findUnique({ where: { email } })
        if (!user) return res.status(401).json({ error: 'Invalid credentials' })

        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(401).json({ error: 'Invalid credentials' })

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

        return res.status(200).json({ token, user })
      } catch (err) {
        console.error('Login error:', err)
        return res.status(500).json({ error: 'Login failed' })
      }
    }

    return res.status(400).json({ error: 'Invalid action' })
  }

  if (req.method === 'GET') {
    // Token validation endpoint
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Token missing' })

    const token = authHeader.split(' ')[1]

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      return res.status(200).json({ valid: true, user: decoded })
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
} 
