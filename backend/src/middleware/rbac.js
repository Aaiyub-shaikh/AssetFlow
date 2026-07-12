const AppError = require('../utils/AppError');
const { ROLES, ROLE_PERMISSIONS } = require('../constants');

const hasPermission = (userRole, requiredPermission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  if (permissions.includes('*')) return true;

  if (permissions.includes(requiredPermission)) return true;

  const [resource] = requiredPermission.split(':');
  if (permissions.includes(`${resource}:*`)) return true;

  return false;
};

const authorize = (...requiredPermissions) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authorized', 401));
  }

  const allowed = requiredPermissions.some((perm) =>
    hasPermission(req.user.role, perm)
  );

  if (!allowed) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  next();
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authorized', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('Insufficient role privileges', 403));
  }

  next();
};

const isAdmin = authorizeRoles(ROLES.ADMIN);
const isAssetManager = authorizeRoles(ROLES.ADMIN, ROLES.ASSET_MANAGER);
const isDepartmentHead = authorizeRoles(ROLES.ADMIN, ROLES.DEPARTMENT_HEAD);
const isManagement = authorizeRoles(
  ROLES.ADMIN,
  ROLES.ASSET_MANAGER,
  ROLES.DEPARTMENT_HEAD
);

module.exports = {
  authorize,
  authorizeRoles,
  hasPermission,
  isAdmin,
  isAssetManager,
  isDepartmentHead,
  isManagement,
};
