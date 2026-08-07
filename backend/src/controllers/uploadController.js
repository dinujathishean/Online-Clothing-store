import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/admin/uploads
 * multipart field `images` (1–8 files). Returns absolute URLs under /uploads.
 */
export const uploadProductImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length) {
    res.status(400).json({ message: 'No images uploaded. Choose files from your PC.' });
    return;
  }

  const host = req.get('x-forwarded-host') || req.get('host');
  const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  const base = `${proto}://${host}`;

  const urls = files.map((f) => `${base}/uploads/${encodeURIComponent(f.filename)}`);
  res.status(201).json({ urls, count: urls.length });
});
