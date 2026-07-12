import express from "express";
import Resource from "../models/Resource.js";

const router = express.Router();

// Get all resources
router.get("/", async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filters = {};

    if (type) filters.type = type;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const resources = await Resource.find(filters).populate("createdBy", "name email");
    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single resource
router.get("/:id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate("createdBy", "name email");
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create resource
router.post("/", async (req, res) => {
  try {
    const { name, type, description, location, capacity, amenities, workingHours, notes } = req.body;

    if (!name || !type || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: name, type, location, capacity"
      });
    }

    const resource = await Resource.create({
      name,
      type,
      description,
      location,
      capacity,
      amenities: amenities || [],
      workingHours,
      notes,
      createdBy: req.userId // Assuming middleware sets this
    });

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update resource
router.put("/:id", async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    res.json({
      success: true,
      message: "Resource updated successfully",
      data: resource
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete resource
router.delete("/:id", async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    res.json({
      success: true,
      message: "Resource deleted successfully",
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
