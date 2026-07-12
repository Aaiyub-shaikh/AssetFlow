import { AssetCategory } from '../models/AssetCategory.js'
import { ErrorResponse } from '../middleware/errorHandler.js'
import mongoose from 'mongoose'

export const getAllCategories = async () => {
  return AssetCategory.find()
}

export const getCategoryById = async (id) => {
  const category = await AssetCategory.findById(id)
  if (!category) {
    throw new ErrorResponse('Category not found', 404)
  }
  return category
}

export const createCategory = async (catData) => {
  const existingCat = await AssetCategory.findOne({
    $or: [{ name: catData.name }, { code: catData.code.toUpperCase() }],
  })
  if (existingCat) {
    throw new ErrorResponse('Category with this name or code already exists', 400)
  }

  const category = await AssetCategory.create({
    ...catData,
    code: catData.code.toUpperCase(),
  })
  return category
}

export const updateCategory = async (id, updateData) => {
  const category = await AssetCategory.findById(id)
  if (!category) {
    throw new ErrorResponse('Category not found', 404)
  }

  if (updateData.name || updateData.code) {
    const query = { _id: { $ne: id } }
    const orCond = []
    if (updateData.name) orCond.push({ name: updateData.name })
    if (updateData.code) orCond.push({ code: updateData.code.toUpperCase() })
    query.$or = orCond

    const conflictCat = await AssetCategory.findOne(query)
    if (conflictCat) {
      throw new ErrorResponse('Another category with this name or code already exists', 400)
    }
  }

  const updatedCat = await AssetCategory.findByIdAndUpdate(
    id,
    {
      ...updateData,
      code: updateData.code ? updateData.code.toUpperCase() : undefined,
    },
    { new: true, runValidators: true }
  )

  return updatedCat
}

export const deleteCategory = async (id) => {
  const category = await AssetCategory.findById(id)
  if (!category) {
    throw new ErrorResponse('Category not found', 404)
  }

  // Check if any assets are linked to this category before deletion
  const assetCount = await mongoose.model('Asset').countDocuments({ categoryId: id })
  if (assetCount > 0) {
    throw new ErrorResponse(
      `Cannot delete category. There are ${assetCount} assets associated with it.`,
      400
    )
  }

  await AssetCategory.findByIdAndDelete(id)
  return true
}
