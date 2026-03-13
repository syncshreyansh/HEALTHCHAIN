function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: `Access denied. This route requires role: ${requiredRole}. Your role: ${req.user.role}`
      });
    }
    next();
  };
}

module.exports = roleMiddleware;
