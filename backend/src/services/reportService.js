import Asset from '../models/Asset.js';
import Booking from '../models/Booking.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import Department from '../models/Department.js';
import AuditCycle from '../models/AuditCycle.js';

const buildMockData = () => ({
  dashboard: {
    totalAssets: 24,
    activeAssets: 16,
    maintenanceAssets: 4,
    retiredAssets: 2,
  },
  utilization: [
    { name: 'Jan', value: 72 },
    { name: 'Feb', value: 74 },
    { name: 'Mar', value: 79 },
    { name: 'Apr', value: 77 },
    { name: 'May', value: 82 },
    { name: 'Jun', value: 80 },
  ],
  department: [
    { name: 'Engineering', value: 8 },
    { name: 'IT Operations', value: 6 },
    { name: 'Facilities', value: 5 },
    { name: 'Sales', value: 5 },
  ],
  maintenance: [
    { name: 'Jan', preventive: 4, corrective: 2, emergency: 0 },
    { name: 'Feb', preventive: 5, corrective: 1, emergency: 1 },
    { name: 'Mar', preventive: 6, corrective: 2, emergency: 0 },
    { name: 'Apr', preventive: 4, corrective: 3, emergency: 1 },
    { name: 'May', preventive: 7, corrective: 2, emergency: 0 },
    { name: 'Jun', preventive: 6, corrective: 1, emergency: 0 },
  ],
  retirement: [
    { asset: 'Legacy Laptop', purchaseDate: '2020-01-15', age: 6, retirementDate: '2025-01-15' },
    { asset: 'Old Printer', purchaseDate: '2019-05-10', age: 7, retirementDate: '2024-05-10' },
  ],
  bookings: [
    { name: 'Mon', week1: 2, week2: 3, week3: 4, week4: 2 },
    { name: 'Tue', week1: 3, week2: 2, week3: 3, week4: 4 },
    { name: 'Wed', week1: 2, week2: 4, week3: 3, week4: 2 },
    { name: 'Thu', week1: 4, week2: 3, week3: 2, week4: 3 },
    { name: 'Fri', week1: 3, week2: 4, week3: 4, week4: 2 },
  ],
});

export const getDashboardSummary = async () => {
  try {
    const [totalAssets, activeAssets, maintenanceAssets, retiredAssets] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: { $in: ['allocated', 'reserved'] } }),
      Asset.countDocuments({ status: 'maintenance' }),
      Asset.countDocuments({ status: 'retired' }),
    ]);

    return { totalAssets, activeAssets, maintenanceAssets, retiredAssets };
  } catch (error) {
    return buildMockData().dashboard;
  }
};

export const getUtilizationData = async () => {
  try {
    const assets = await Asset.find({}, { status: 1, department: 1 }).lean();
    const activeCount = assets.filter((asset) => ['allocated', 'reserved'].includes(asset.status)).length;
    return [{ name: 'Active', value: activeCount }, { name: 'Available', value: assets.length - activeCount }];
  } catch {
    return buildMockData().utilization;
  }
};

export const getDepartmentData = async () => {
  try {
    const departments = await Department.find({}, { name: 1 }).lean();
    const assets = await Asset.find({}, { department: 1 }).lean();
    return departments.map((department) => ({
      name: department.name,
      value: assets.filter((asset) => asset.department?.toString() === department._id.toString()).length,
    }));
  } catch {
    return buildMockData().department;
  }
};

export const getMaintenanceData = async () => {
  try {
    const maintenance = await MaintenanceRequest.find({}, { type: 1, createdAt: 1 }).lean();
    return maintenance.length ? maintenance.map((item) => ({ name: item.type, value: 1 })) : buildMockData().maintenance;
  } catch {
    return buildMockData().maintenance;
  }
};

export const getRetirementData = async () => {
  try {
    const assets = await Asset.find({ status: 'retired' }, { name: 1, acquisitionDate: 1 }).lean();
    return assets.length ? assets.map((asset) => ({ asset: asset.name, purchaseDate: asset.acquisitionDate, age: 5, retirementDate: asset.acquisitionDate })) : buildMockData().retirement;
  } catch {
    return buildMockData().retirement;
  }
};

export const getBookingHeatmapData = async () => {
  try {
    const bookings = await Booking.find({}, { startDate: 1 }).lean();
    return bookings.length ? bookings.map((booking) => ({ name: 'Bookings', value: booking.startDate })) : buildMockData().bookings;
  } catch {
    return buildMockData().bookings;
  }
};

export const exportReports = async () => {
  const summary = await getDashboardSummary();
  return {
    ...summary,
    generatedAt: new Date().toISOString(),
  };
};
