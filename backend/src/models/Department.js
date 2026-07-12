import mongoose from 'mongoose'

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    budget: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

departmentSchema.index({ code: 1 })

export const Department = mongoose.model('Department', departmentSchema)
