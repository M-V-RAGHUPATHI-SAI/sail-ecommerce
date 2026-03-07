import express from 'express';
import { renderPayment, placeOrder, viewOrders, cancelOrder } from '../controllers/orderController.js';
import { requireLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/orders', requireLogin, viewOrders);
router.post('/payment', requireLogin, renderPayment);
router.post('/create-order', requireLogin, placeOrder);
router.post('/orders/:id/cancel', requireLogin, cancelOrder);

export default router;
