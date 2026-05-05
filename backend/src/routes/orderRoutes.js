import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { checkout, listMyOrders, getMyOrder } from '../controllers/orderController.js';

const router = Router();

router.use(protect);

router.post('/checkout', checkout);
router.get('/mine', listMyOrders);
router.get('/:id', getMyOrder);

export default router;
