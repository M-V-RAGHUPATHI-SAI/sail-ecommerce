import { getProductById, searchProducts } from '../database/queries.js';

export const viewProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await getProductById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('product', { product });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Server Error');
    }
};

export const search = async (req, res) => {
    const query = req.query.query || '';

    try {
        const results = await searchProducts(query);
        res.render('searchResults', { results, query }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};
