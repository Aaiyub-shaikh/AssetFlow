import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ROLES } from '../constants/index.js'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: false, // Admin might set this later or during creation
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.EMPLOYEE,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    position: {
      type: String,
      default: 'Employee',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: function () {
        const firstName = this.name ? this.name.split(' ')[0] : 'User'
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`
      },
    },
  },
  {
    timestamps: true,
  }
)

// Index email for high-speed queries
userSchema.index({ email: 1 })

// Pre-save password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate JWT
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export const User = mongoose.model('User', userSchema)
