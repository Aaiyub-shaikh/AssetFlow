import mongoose from 'mongoose'

const assetCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Category code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    depreciationRate: {
      type: Number,
      required: [true, 'Depreciation rate is required'],
      min: 0,
      max: 100,
    },
    warrantyPeriod: {
      type: Number,
      default: 12, // in months
    },
    icon: {
      type: String,
      default: 'Package',
    },
  },
  {
    timestamps: true,
  }
)

assetCategorySchema.index({ code: 1 })

export const AssetCategory = mongoose.model('AssetCategory', assetCategorySchema)
