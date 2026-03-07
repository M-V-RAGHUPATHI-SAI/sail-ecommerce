import express from 'express';

const router = express.Router();

import { getAllProducts } from '../database/queries.js';

router.get('/', async (req, res) => {
    try {
        const products = await getAllProducts();
        res.render('main', { products });
    } catch(err) {
        console.error('Error fetching homepage products:', err);
        res.render('main', { products: [] });
    }
});

export default router;
