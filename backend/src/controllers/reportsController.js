import { getDashboardSummary, getUtilizationData, getDepartmentData, getMaintenanceData, getRetirementData, getBookingHeatmapData, exportReports } from '../services/reportService.js';

export const getDashboardReport = async (req, res) => {
  try {
    const data = await getDashboardSummary();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUtilizationReport = async (req, res) => {
  try {
    const data = await getUtilizationData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartmentReport = async (req, res) => {
  try {
    const data = await getDepartmentData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMaintenanceReport = async (req, res) => {
  try {
    const data = await getMaintenanceData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRetirementReport = async (req, res) => {
  try {
    const data = await getRetirementData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingReport = async (req, res) => {
  try {
    const data = await getBookingHeatmapData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportReport = async (req, res) => {
  try {
    const data = await exportReports();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
