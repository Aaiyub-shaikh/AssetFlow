import express from 'express';
import {
  createAuditCycle,
  getAllAuditCycles,
  getAuditCycleById,
  updateAuditCycle,
  deleteAuditCycle,
  closeAuditCycle,
  generateDiscrepancyReport,
} from '../controllers/auditController.js';

const router = express.Router();

router.get('/', getAllAuditCycles);
router.get('/:id', getAuditCycleById);
router.post('/', createAuditCycle);
router.put('/:id', updateAuditCycle);
router.delete('/:id', deleteAuditCycle);
router.post('/:id/close', closeAuditCycle);
router.get('/:id/report', generateDiscrepancyReport);

export default router;
