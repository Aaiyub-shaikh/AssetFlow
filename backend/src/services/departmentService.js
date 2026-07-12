import mongoose from 'mongoose'
import { Department } from '../models/Department.js'
import { ErrorResponse } from '../middleware/errorHandler.js'

export const getAllDepartments = async () => {
  return Department.find().populate('head', 'name email avatar position')
}

export const getDepartmentById = async (id) => {
  const dept = await Department.findById(id).populate('head', 'name email avatar position')
  if (!dept) {
    throw new ErrorResponse('Department not found', 404)
  }
  return dept
}

export const createDepartment = async (deptData) => {
  const existingDept = await Department.findOne({
    $or: [{ name: deptData.name }, { code: deptData.code.toUpperCase() }],
  })
  if (existingDept) {
    throw new ErrorResponse('Department with this name or code already exists', 400)
  }

  const dept = await Department.create({
    ...deptData,
    code: deptData.code.toUpperCase(),
  })
  return dept.populate('head', 'name email avatar position')
}

export const updateDepartment = async (id, updateData) => {
  const dept = await Department.findById(id)
  if (!dept) {
    throw new ErrorResponse('Department not found', 404)
  }

  // Check if name/code conflicts with another department
  if (updateData.name || updateData.code) {
    const query = { _id: { $ne: id } }
    const orCond = []
    if (updateData.name) orCond.push({ name: updateData.name })
    if (updateData.code) orCond.push({ code: updateData.code.toUpperCase() })
    query.$or = orCond

    const conflictDept = await Department.findOne(query)
    if (conflictDept) {
      throw new ErrorResponse('Another department with this name or code already exists', 400)
    }
  }

  const updatedDept = await Department.findByIdAndUpdate(
    id,
    {
      ...updateData,
      code: updateData.code ? updateData.code.toUpperCase() : undefined,
    },
    { new: true, runValidators: true }
  ).populate('head', 'name email avatar position')

  return updatedDept
}

export const deleteDepartment = async (id) => {
  const dept = await Department.findById(id)
  if (!dept) {
    throw new ErrorResponse('Department not found', 404)
  }

  // Check if any employees are linked to this department before deletion
  // (We can import User model inside, or verify using mongoose query)
  // Let's do a simple count check
  const employeeCount = await mongoose.model('User').countDocuments({ department: id })
  if (employeeCount > 0) {
    throw new ErrorResponse(
      `Cannot delete department. There are ${employeeCount} employees assigned to it.`,
      400
    )
  }

  await Department.findByIdAndDelete(id)
  return true
}
