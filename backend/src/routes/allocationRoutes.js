import express from "express";
import * as allocationController from "../controllers/allocationController.js";

const router = express.Router();

// Allocation routes
router.post("/assets/:id/allocate", allocationController.allocateAsset);
router.post("/assets/:id/return", allocationController.returnAsset);
router.get("/allocations/overdue", allocationController.getOverdueAllocations);
router.get("/allocations", allocationController.getAllAllocations);

// Transfer routes
router.post("/transfers", allocationController.createTransferRequest);
router.get("/transfers", allocationController.getTransfers);
router.put("/transfers/:id/action", allocationController.processTransferAction);

export default router;
