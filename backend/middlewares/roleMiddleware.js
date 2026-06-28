// Middleware to check if user has a specific role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Access denied. Allowed roles: ${roles.join(', ')}`));
    }
    next();
  };
};

module.exports = { requireRole };
