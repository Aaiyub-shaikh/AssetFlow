import AuditCycle from '../models/AuditCycle.js';

export const createAuditCycle = async (req, res) => {
  try {
    const { name, department, location, startDate, endDate, assignedAuditors, createdBy } = req.body;

    if (!name || !department || !location || !startDate || !endDate || !createdBy) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const auditCycle = await AuditCycle.create({
      name,
      department,
      location,
      startDate,
      endDate,
      assignedAuditors: assignedAuditors || [],
      createdBy,
    });

    res.status(201).json({ success: true, data: auditCycle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAuditCycles = async (req, res) => {
  try {
    const auditCycles = await AuditCycle.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: auditCycles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditCycleById = async (req, res) => {
  try {
    const auditCycle = await AuditCycle.findById(req.params.id);
    if (!auditCycle) {
      return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    }

    res.status(200).json({ success: true, data: auditCycle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAuditCycle = async (req, res) => {
  try {
    const auditCycle = await AuditCycle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!auditCycle) {
      return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    }

    res.status(200).json({ success: true, data: auditCycle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAuditCycle = async (req, res) => {
  try {
    const auditCycle = await AuditCycle.findByIdAndDelete(req.params.id);
    if (!auditCycle) {
      return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    }

    res.status(200).json({ success: true, message: 'Audit cycle deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closeAuditCycle = async (req, res) => {
  try {
    const auditCycle = await AuditCycle.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Closed',
        closedBy: req.body.closedBy || 'System User',
        closedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!auditCycle) {
      return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    }

    res.status(200).json({ success: true, data: auditCycle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateDiscrepancyReport = async (req, res) => {
  try {
    const auditCycle = await AuditCycle.findById(req.params.id);
    if (!auditCycle) {
      return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    }

    const discrepancies = auditCycle.entries.filter(
      (entry) => entry.verificationStatus === 'Missing' || entry.verificationStatus === 'Damaged'
    );

    res.status(200).json({ success: true, data: discrepancies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
