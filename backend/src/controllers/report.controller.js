const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const reportService = require('../services/report.service');
const dashboardService = require('../services/dashboard.service');

exports.getReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { format = 'json', days } = req.query;

  const result = await reportService.getReport(type, format, { days: parseInt(days, 10) });

  if (format === 'json') {
    return ApiResponse.success(res, result);
  }

  if (result.buffer) {
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.buffer);
  }

  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  return res.send(result.content);
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const [kpis, recentActivity, statusChart, deptChart] = await Promise.all([
    dashboardService.getDashboardKPIs(),
    dashboardService.getRecentActivity(10),
    dashboardService.getAssetStatusChart(),
    dashboardService.getDepartmentAssetChart(),
  ]);

  return ApiResponse.success(res, {
    ...kpis,
    recentActivity,
    charts: {
      assetStatus: statusChart,
      departmentAssets: deptChart,
    },
  });
});

exports.getUserDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getUserDashboard(req.user._id);
  return ApiResponse.success(res, data);
});
