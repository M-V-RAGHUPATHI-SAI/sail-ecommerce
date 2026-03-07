import { getAllOrdersAdmin, updateOrderStatus, getAllProducts, addProduct, updateProduct, deleteProduct, getProductById } from '../database/queries.js';

export const dashboard = async (req, res) => {
    try {
        const orders = await getAllOrdersAdmin();
        const products = await getAllProducts();
        res.render('admin/dashboard', { orders, products });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

export const updateOrderStatusController = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await updateOrderStatus(id, status);
        res.redirect('/admin');
    } catch(err) {
        console.error(err);
        res.status(500).send("Failed to update status");
    }
};

export const renderAddProduct = (req, res) => {
    res.render('admin/productForm', { product: null });
};

export const renderEditProduct = async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        res.render('admin/productForm', { product });
    } catch(err) {
        res.status(500).send("Error fetching product");
    }
};

export const saveProduct = async (req, res) => {
    const { id } = req.params;
    const { p_name, p_price, p_stock, p_descpt } = req.body;
    try {
        if(id) {
            await updateProduct(id, { p_name: p_name, p_price: p_price, p_stock: p_stock || 10, p_descpt: p_descpt });
        } else {
            await addProduct({ p_name: p_name, p_price: p_price, p_stock: p_stock || 10, p_descpt: p_descpt });
        }
        res.redirect('/admin');
    } catch(err) {
        console.error(err);
        res.status(500).send("Error saving product");
    }
};

export const removeProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteProduct(id);
        res.redirect('/admin');
    } catch(err) {
        res.status(500).send("Error deleting product");
    }
};
