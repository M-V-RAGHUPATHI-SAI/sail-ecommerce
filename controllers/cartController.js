import { getCartItems, addToCart, removeFromCart, updateCartQuantity } from '../database/queries.js';

export const viewCart = async (req, res) => {
    const customerId = req.session.customer_id;
    try {
        const cartItems = await getCartItems(customerId);
        let cartTotal = 0;
        cartItems.forEach(item => {
            cartTotal += item.p_price * item.quantity;
        });

        res.render('cart', { cartItems, cartTotal });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart elements' });
    }
};

export const addProductToCart = async (req, res) => {
    const customerId = req.session.customer_id;
    const { productId } = req.body;
    try {
        await addToCart(customerId, productId);
        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('Failed to add product to cart');
    }
};

export const removeProductFromCart = async (req, res) => {
    const customerId = req.session.customer_id;
    const { cartId } = req.params;
    try {
        await removeFromCart(cartId, customerId);
        return res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error(`Error removing item from cart:`, error);
        return res.status(500).json({ message: 'Failed to remove item from cart.' });
    }
};

export const updateQuantity = async (req, res) => {
    const customerId = req.session.customer_id;
    const { cartId } = req.params;
    const { quantity } = req.body; 

    try {
        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity cannot be less than 1' });
        }
        await updateCartQuantity(cartId, customerId, quantity);
        return res.status(200).json({ message: 'Cart updated successfully.' });
    } catch (error) {
        console.error(`Error updating cart:`, error);
        return res.status(500).json({ message: 'Failed to update cart.' });
    }
};
