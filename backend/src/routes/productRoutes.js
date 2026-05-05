import { Router } from 'express';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { listProducts, getProduct } from '../controllers/productController.js';

const router = Router();

router.get('/', optionalAuth, listProducts);
router.get('/:id', optionalAuth, getProduct);

export default router;
