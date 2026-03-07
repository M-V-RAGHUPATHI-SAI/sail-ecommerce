import express from 'express';
import { dashboard, updateOrderStatusController, renderAddProduct, renderEditProduct, saveProduct, removeProduct } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// protect all below routes
router.use(requireAdmin); 

router.get('/', dashboard);
router.get('/products', dashboard);
router.get('/products/add', renderAddProduct);
router.get('/products/edit/:id', renderEditProduct);
router.post('/products/save/:id?', saveProduct);
router.post('/products/delete/:id', removeProduct);

router.get('/orders', dashboard);
router.post('/orders/update-status/:id', updateOrderStatusController);

export default router;
