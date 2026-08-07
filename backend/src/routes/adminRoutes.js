import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { adminSummary } from '../controllers/adminStatsController.js';
import { listAdminOrders, getAdminOrder, patchAdminOrderStatus } from '../controllers/orderController.js';
import { uploadProductImages } from '../controllers/uploadController.js';
import { uploadImages } from '../middleware/upload.js';
import { createProductRules, updateProductRules, productIdParam } from '../validators/productValidators.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/summary', adminSummary);
router.get('/dashboard', adminSummary);

router.post('/uploads', (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err) {
      res.status(400).json({ message: err.message || 'Upload failed' });
      return;
    }
    next();
  });
}, uploadProductImages);

router.post('/products', createProductRules, createProduct);
router.put('/products/:id', updateProductRules, updateProduct);
router.delete('/products/:id', productIdParam, deleteProduct);

router.get('/orders', listAdminOrders);
router.get('/orders/:id', getAdminOrder);
router.patch('/orders/:id', patchAdminOrderStatus);

export default router;
