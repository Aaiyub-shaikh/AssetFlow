const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const {
  Asset,
  AssetAllocation,
  Booking,
  MaintenanceRequest,
  Department,
  AuditCycle,
} = require('../models');

const getAssetUtilization = async () => {
  const total = await Asset.countDocuments({ status: { $nin: ['disposed', 'retired'] } });
  const allocated = await Asset.countDocuments({ status: 'allocated' });
  const available = await Asset.countDocuments({ status: 'available' });
  const maintenance = await Asset.countDocuments({ status: 'under_maintenance' });
  const reserved = await Asset.countDocuments({ status: 'reserved' });

  return {
    total,
    allocated,
    available,
    maintenance,
    reserved,
    utilizationRate: total > 0 ? Math.round((allocated / total) * 100) : 0,
    breakdown: [
      { status: 'allocated', count: allocated, percentage: total ? Math.round((allocated / total) * 100) : 0 },
      { status: 'available', count: available, percentage: total ? Math.round((available / total) * 100) : 0 },
      { status: 'under_maintenance', count: maintenance, percentage: total ? Math.round((maintenance / total) * 100) : 0 },
      { status: 'reserved', count: reserved, percentage: total ? Math.round((reserved / total) * 100) : 0 },
    ],
  };
};

const getIdleAssets = async (daysThreshold = 30) => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  const idleAssets = await Asset.find({
    status: 'available',
    updatedAt: { $lte: thresholdDate },
  })
    .populate('category', 'name')
    .populate('department', 'name code')
    .select('name assetTag serialNumber acquisitionCost department category updatedAt')
    .limit(100);

  return {
    thresholdDays: daysThreshold,
    count: idleAssets.length,
    assets: idleAssets,
  };
};

const getMaintenanceFrequency = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const byType = await MaintenanceRequest.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: '$type', count: { $sum: 1 }, totalCost: { $sum: '$cost' } } },
  ]);

  const byMonth = await MaintenanceRequest.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const topAssets = await MaintenanceRequest.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: '$asset', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'assets',
        localField: '_id',
        foreignField: '_id',
        as: 'asset',
      },
    },
    { $unwind: '$asset' },
    {
      $project: {
        assetName: '$asset.name',
        assetTag: '$asset.assetTag',
        count: 1,
      },
    },
  ]);

  return { byType, byMonth, topAssets };
};

const getDepartmentAllocation = async () => {
  const departments = await Department.find({ isActive: true });

  const data = await Promise.all(
    departments.map(async (dept) => {
      const [total, allocated, employees] = await Promise.all([
        Asset.countDocuments({ department: dept._id }),
        Asset.countDocuments({ department: dept._id, status: 'allocated' }),
        AssetAllocation.countDocuments({ department: dept._id, status: 'active' }),
      ]);

      return {
        departmentId: dept._id,
        departmentName: dept.name,
        departmentCode: dept.code,
        totalAssets: total,
        allocatedAssets: allocated,
        activeAllocations: employees,
        utilizationRate: total > 0 ? Math.round((allocated / total) * 100) : 0,
      };
    })
  );

  return data;
};

const getBookingHeatmap = async () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const bookings = await Booking.aggregate([
    {
      $match: {
        status: { $in: ['confirmed', 'completed'] },
        startDate: { $gte: threeMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          dayOfWeek: { $dayOfWeek: '$startDate' },
          hour: { $hour: '$startDate' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } },
  ]);

  const byAsset = await Booking.aggregate([
    {
      $match: {
        status: { $in: ['confirmed', 'completed'] },
        startDate: { $gte: threeMonthsAgo },
      },
    },
    { $group: { _id: '$asset', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: { from: 'assets', localField: '_id', foreignField: '_id', as: 'asset' },
    },
    { $unwind: '$asset' },
    {
      $project: { assetName: '$asset.name', assetTag: '$asset.assetTag', bookings: '$count' },
    },
  ]);

  return { heatmap: bookings, topBookedAssets: byAsset };
};

const generatePDFReport = async (reportType, data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('AssetFlow Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Report Type: ${reportType}`);
    doc.text(`Generated: ${new Date().toISOString()}`);
    doc.moveDown();

    if (reportType === 'utilization') {
      doc.text(`Total Assets: ${data.total}`);
      doc.text(`Utilization Rate: ${data.utilizationRate}%`);
      data.breakdown?.forEach((item) => {
        doc.text(`  ${item.status}: ${item.count} (${item.percentage}%)`);
      });
    } else if (reportType === 'department_allocation') {
      data.forEach((dept) => {
        doc.text(`${dept.departmentName}: ${dept.allocatedAssets}/${dept.totalAssets} (${dept.utilizationRate}%)`);
      });
    } else {
      doc.text(JSON.stringify(data, null, 2).substring(0, 2000));
    }

    doc.end();
  });
};

const generateExcelReport = async (reportType, data) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(reportType);

  if (reportType === 'utilization') {
    sheet.columns = [
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Count', key: 'count', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 15 },
    ];
    sheet.addRows(data.breakdown || []);
  } else if (reportType === 'department_allocation') {
    sheet.columns = [
      { header: 'Department', key: 'departmentName', width: 25 },
      { header: 'Total Assets', key: 'totalAssets', width: 15 },
      { header: 'Allocated', key: 'allocatedAssets', width: 15 },
      { header: 'Utilization %', key: 'utilizationRate', width: 15 },
    ];
    sheet.addRows(data);
  } else if (reportType === 'idle_assets') {
    sheet.columns = [
      { header: 'Asset Tag', key: 'assetTag', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Serial', key: 'serialNumber', width: 20 },
    ];
    const rows = (data.assets || []).map((a) => ({
      assetTag: a.assetTag,
      name: a.name,
      serialNumber: a.serialNumber,
    }));
    sheet.addRows(rows);
  }

  return workbook.xlsx.writeBuffer();
};

const generateCSVReport = (reportType, data) => {
  let csv = '';

  if (reportType === 'utilization') {
    csv = 'Status,Count,Percentage\n';
    (data.breakdown || []).forEach((row) => {
      csv += `${row.status},${row.count},${row.percentage}\n`;
    });
  } else if (reportType === 'department_allocation') {
    csv = 'Department,Total Assets,Allocated,Utilization Rate\n';
    data.forEach((row) => {
      csv += `${row.departmentName},${row.totalAssets},${row.allocatedAssets},${row.utilizationRate}\n`;
    });
  }

  return csv;
};

const getReport = async (type, format = 'json', options = {}) => {
  let data;

  switch (type) {
    case 'utilization':
      data = await getAssetUtilization();
      break;
    case 'idle_assets':
      data = await getIdleAssets(options.days || 30);
      break;
    case 'maintenance_frequency':
      data = await getMaintenanceFrequency();
      break;
    case 'department_allocation':
      data = await getDepartmentAllocation();
      break;
    case 'booking_heatmap':
      data = await getBookingHeatmap();
      break;
    default:
      throw new Error(`Unknown report type: ${type}`);
  }

  if (format === 'pdf') {
    return { buffer: await generatePDFReport(type, data), contentType: 'application/pdf', filename: `${type}-report.pdf` };
  }
  if (format === 'excel') {
    return { buffer: await generateExcelReport(type, data), contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `${type}-report.xlsx` };
  }
  if (format === 'csv') {
    return { content: generateCSVReport(type, data), contentType: 'text/csv', filename: `${type}-report.csv` };
  }

  return data;
};

module.exports = {
  getAssetUtilization,
  getIdleAssets,
  getMaintenanceFrequency,
  getDepartmentAllocation,
  getBookingHeatmap,
  getReport,
};
