import express from 'express';
import { viewCart, addProductToCart, removeProductFromCart, updateQuantity } from '../controllers/cartController.js';
import { requireLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/cart', requireLogin, viewCart);
router.post('/add-to-cart', requireLogin, addProductToCart);
router.delete('/remove-from-cart/:cartId', requireLogin, removeProductFromCart);
router.put('/update-cart/:cartId', requireLogin, updateQuantity);

export default router;
