import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { ErrorResponse } from '../middleware/errorHandler.js'
import nodemailer from 'nodemailer'

// Create mail transporter
const getTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return null
}

export const registerUser = async ({ name, email, password, department }) => {
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ErrorResponse('Email already registered', 400)
  }

  // Signup only creates Employee account. No role selection during signup.
  const user = await User.create({
    name,
    email,
    password,
    department,
    role: 'employee', // Hardcoded as employee on signup
  })

  // Exclude password from return
  const userObj = user.toObject()
  delete userObj.password

  const token = user.generateAuthToken()

  return { user: userObj, token }
}

export const authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password').populate('department')
  if (!user) {
    throw new ErrorResponse('Invalid email or password', 401)
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new ErrorResponse('Invalid email or password', 401)
  }

  const userObj = user.toObject()
  delete userObj.password

  const token = user.generateAuthToken()

  return { user: userObj, token }
}

export const generatePasswordReset = async (email, origin) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new ErrorResponse('No employee account found with this email', 404)
  }

  // Create reset secret unique to this user's current password
  const secret = process.env.JWT_SECRET + user.password
  const token = jwt.sign({ id: user._id, email: user.email }, secret, {
    expiresIn: '1h',
  })

  const resetUrl = `${origin}/reset-password?token=${token}&id=${user._id}`
  const message = `
    <h1>AssetFlow Password Reset</h1>
    <p>You requested a password reset. Please use the link below to set a new password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
  `

  const transporter = getTransporter()
  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@assetflow.io',
      to: user.email,
      subject: 'AssetFlow - Password Reset Request',
      html: message,
    })
  } else {
    console.log(`\n--- PASSWORD RESET SIMULATION ---`)
    console.log(`To: ${user.email}`)
    console.log(`Link: ${resetUrl}`)
    console.log(`---------------------------------\n`)
  }

  return true
}

export const resetUserPassword = async (userId, token, newPassword) => {
  const user = await User.findById(userId).select('+password')
  if (!user) {
    throw new ErrorResponse('User not found', 404)
  }

  // Verify token using the same custom secret
  const secret = process.env.JWT_SECRET + user.password
  try {
    jwt.verify(token, secret)
  } catch (error) {
    throw new ErrorResponse('Invalid or expired reset token', 400)
  }

  // Set new password (pre-save hook will hash it)
  user.password = newPassword
  await user.save()

  return true
}
