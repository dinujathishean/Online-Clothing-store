/**
 * Must run after `protect`. Only users with role `ADMIN` may access the route.
 */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
}
