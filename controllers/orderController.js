import { getProductById, createOrder, insertOrder, getOrders, getAddressByCustomerId, clearCart, updateOrderStatus, getOrderByIdAndCustomer } from '../database/queries.js';

export const renderPayment = async (req, res) => {
    const customerId = req.session.customer_id;
    try {
        let products = [];
        let totalAmount = 0;

        if (req.body.product_id) {
            const product = await getProductById(req.body.product_id);
            if (product) {
                products.push({ id: product.p_id, name: product.p_name, price: product.p_price, quantity: 1, description: product.p_descpt });
                totalAmount += product.p_price;
            }
        } else if (req.body.cartItems) {
            const cartItems = JSON.parse(req.body.cartItems);
            for (const item of cartItems) {
                // frontend might send p_id or id
                const pid = item.p_id || item.id;
                const product = await getProductById(pid);
                if (product) {
                    products.push({ id: product.p_id, name: product.p_name, price: product.p_price, quantity: item.quantity, description: product.p_descpt });
                    totalAmount += product.p_price * item.quantity;
                }
            }
        }

        res.render('payment', { customerId, products, totalAmount });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send('An error occurred while processing your payment.');
    }
};

export const placeOrder = async (req, res) => {
    const customerId = req.session.customer_id;
    try {
        const { cartItems } = req.body; 
        const products = [];
        let totalAmount = 0;

        if (!cartItems) return res.status(400).send('No items provided.');
        const parsedCartItems = JSON.parse(cartItems);

        for (const item of parsedCartItems) {
            const pid = item.id || item.p_id; 
            const product = await getProductById(pid); 
            if (product) {
                products.push({ id: product.p_id, name: product.p_name, price: product.p_price, quantity: item.quantity, description: product.p_descpt });
                totalAmount += product.p_price * item.quantity; 
            }
        }

        if (products.length === 0) return res.status(400).send('No products found for order.');

        const { paymentId, paymentDetails } = await createOrder(customerId, products, totalAmount);
        const orderId = await insertOrder(paymentId, customerId, totalAmount, paymentDetails);
        
        // Clear customer cart after purchase
        await clearCart(customerId);

        res.redirect('/orders');
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('An error occurred while creating your order.');
    }
};

export const viewOrders = async (req, res) => {
    const customerId = req.session.customer_id;

    try {
        const orders = await getOrders(customerId);
        let formattedOrders = [];
        if(orders && orders.length > 0) {
            formattedOrders = orders.map(order => ({
                orderId: order.o_id,
                orderDate: order.o_date,
                totalCost: order.o_total_amt,
                shipTo: res.locals.addressDetails || "Default Shipping Address",
                status: order.o_status, 
                shippingMethod: "Standard Shipping", 
                orderItems : order.o_items || 1 
            }));
        }

        res.render('orders', { orders: formattedOrders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
};

export const cancelOrder = async (req, res) => {
    const customerId = req.session.customer_id;
    const orderId = req.params.id;

    try {
        const order = await getOrderByIdAndCustomer(orderId, customerId);
        
        if (!order) {
            return res.status(404).send('Order not found or access denied.');
        }

        if (order.o_status === 'Placed' || order.o_status === 'Packed') {
            await updateOrderStatus(orderId, 'Cancelled');
            res.redirect('/orders');
        } else {
            res.status(400).send('Order cannot be cancelled at this stage.');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).send('An error occurred while cancelling your order.');
    }
};
