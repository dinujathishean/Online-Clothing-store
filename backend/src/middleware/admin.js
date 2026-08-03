/**
 * Must run after `protect`. Only users with role `ADMIN` may access the route.
 */
export function adminOnly(req, res, next) {
  const role = String(req.user?.role || '').toUpperCase();
  if (!req.user || role !== 'ADMIN') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
}
