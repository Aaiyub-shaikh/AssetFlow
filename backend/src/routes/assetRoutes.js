import express from "express";
import * as assetController from "../controllers/assetController.js";

const router = express.Router();

// Asset routes
router.post("/", assetController.registerAsset);
router.get("/", assetController.getAssetDirectory);
router.get("/:id", assetController.getAssetDetails);
router.put("/:id", assetController.updateAsset);
router.delete("/:id", assetController.deleteAsset);

export default router;
