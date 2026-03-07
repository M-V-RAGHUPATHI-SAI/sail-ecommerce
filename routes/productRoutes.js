import express from 'express';
import { viewProduct, search } from '../controllers/productController.js';

const router = express.Router();

router.get('/product/:id', viewProduct);
router.get('/search', search);

export default router;
