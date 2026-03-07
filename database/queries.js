import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// --- CUSTOMER QUERIES ---

export const addCustomer = async (customerData) => {
    const { first_name, last_name, date_of_birth, email, password, phno, address, city, state, country, pincode } = customerData;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const [result] = await pool.execute(
            `INSERT INTO customer (first_name, last_name, date_of_birth, email, password, phno, address, city, state, country, pincode) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, date_of_birth, email, hashedPassword, phno, address, city, state, country, pincode]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding customer:', error);
        throw error;
    }
};

export const getCustomerByEmail = async (email) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM customer WHERE email = ?', [email]);
        if (rows.length === 0) return null;
        return rows[0];
    } catch (error) {
        console.error('Error fetching customer by email:', error);
        throw error;
    }
};

export const getCustomerByEmailAndPassword = async (email, password) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM customer WHERE email = ?', [email]);
        if (rows.length === 0) return null;
        
        const customer = rows[0];
        const passwordMatch = await bcrypt.compare(password, customer.password);
        if (passwordMatch) return customer;
        return null; 
    } catch (error) {
        console.error('Error fetching customer by email and password:', error);
        throw error;
    }
};

export const getCustomerById = async (customerId) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM customer WHERE customer_id = ?', [customerId]);
        if (rows.length === 0) return null;
        return rows[0];
    } catch (error) {
        console.error('Error fetching customer by ID:', error);
        throw error;
    }
};

export const getAddressByCustomerId = async (customerId) => {
    try {
        const [rows] = await pool.execute(
            `SELECT address, city, state, country, pincode FROM customer WHERE customer_id = ?`,
            [customerId]
        );
        if (rows.length > 0) return rows[0];
        throw new Error('Address not found for this customer');
    } catch (error) {
        throw error;
    }
};

export const updateAddress = async (customerId, addressData) => {
    const { address, city, state, country, pincode } = addressData;
    try {
        await pool.execute(
            `UPDATE customer SET address = ?, city = ?, state = ?, country = ?, pincode = ? WHERE customer_id = ?`,
            [address, city, state, country, pincode, customerId]
        );
    } catch (error) {
        throw error;
    }
};

// --- PRODUCT QUERIES ---

export const getProductById = async (productId) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM products WHERE p_id = ?', [productId]);
        if (rows.length > 0) return rows[0];
        return null;
    } catch (error) {
        throw error;
    }
};

export const searchProducts = async (query) => {
    const sql = 'SELECT * FROM products WHERE LOWER(p_descpt) LIKE ? OR LOWER(p_name) LIKE ?';
    const values = [`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`];
    try {
        const [results] = await pool.execute(sql, values);
        return results;
    } catch (error) {
        throw error;
    }
};

export const getAllProducts = async () => {
    try {
        const [results] = await pool.execute('SELECT * FROM products');
        return results;
    } catch (error) {
        throw error;
    }
};

export const addProduct = async (productData) => {
    const { p_name, p_price, p_stock, p_descpt } = productData;
    try {
        const [result] = await pool.execute(
            'INSERT INTO products (p_name, p_price, p_stock, p_descpt) VALUES (?, ?, ?, ?)',
            [p_name, p_price, p_stock, p_descpt]
        );
        return result.insertId;
    } catch (error) {
        throw error;
    }
}

export const updateProduct = async (p_id, productData) => {
    const { p_name, p_price, p_stock, p_descpt } = productData;
    try {
        await pool.execute(
            'UPDATE products SET p_name = ?, p_price = ?, p_stock = ?, p_descpt = ? WHERE p_id = ?',
            [p_name, p_price, p_stock, p_descpt, p_id]
        );
    } catch (error) {
        throw error;
    }
}
export const deleteProduct = async (p_id) => {
    try {
        // delete from cart first due to foreign keys
        await pool.execute('DELETE FROM cart WHERE product_id = ?', [p_id]);
        await pool.execute('DELETE FROM products WHERE p_id = ?', [p_id]);
    } catch (error) {
        throw error;
    }
}


// --- CART QUERIES ---

export const getCartItems = async (customerId) => {
    if (!customerId) return [];
    try {
        const [rows] = await pool.execute(
            'SELECT cart.cart_id, cart.quantity, products.p_id, products.p_name, products.p_price FROM cart JOIN products ON cart.product_id = products.p_id WHERE cart.customer_id = ?',
            [customerId]
        );
        return rows; 
    } catch (error) {
        throw error;
    }
};

export const addToCart = async (customerId, productId) => {
    try {
        const [productRows] = await pool.execute('SELECT * FROM products WHERE p_id = ?', [productId]);
        if (productRows.length > 0) {
            const [cartRows] = await pool.execute('SELECT * FROM cart WHERE product_id = ? AND customer_id = ?', [productId, customerId]);
            if (cartRows.length > 0) {
                const cartItemId = cartRows[0].cart_id;
                await pool.execute('UPDATE cart SET quantity = quantity + 1 WHERE cart_id = ?', [cartItemId]);
            } else {
                await pool.execute(
                    'INSERT INTO cart (product_id, customer_id, quantity) VALUES (?, ?, ?)',
                    [productId, customerId, 1] 
                );
            }
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        throw error;
    }
};

export const removeFromCart = async (cartId, customerId) => {
    try {
        const [cartRows] = await pool.execute('SELECT * FROM cart WHERE cart_id = ? AND customer_id = ?', [cartId, customerId]);
        if (cartRows.length === 0) throw new Error(`Item not found in your cart.`);

        const currentQuantity = cartRows[0].quantity;
        if (currentQuantity > 1) {
            await pool.execute('UPDATE cart SET quantity = quantity - 1 WHERE cart_id = ?', [cartId]);
        } else {
            await pool.execute('DELETE FROM cart WHERE cart_id = ?', [cartId]);
        }
        return true; 
    } catch (error) {
        throw error;
    }
};

export const updateCartQuantity = async (cartId, customerId, newQuantity) => {
    try {
        if (newQuantity < 1) throw new Error('Quantity must be at least 1');
        const [result] = await pool.execute('UPDATE cart SET quantity = ? WHERE cart_id = ? AND customer_id = ?', [newQuantity, cartId, customerId]);
        if (result.affectedRows === 0) throw new Error(`Item not found in your cart.`);
    } catch (error) {
        throw error;
    }
};

export const clearCart = async (customerId) => {
    try {
        await pool.execute('DELETE FROM cart WHERE customer_id = ?', [customerId]);
    } catch (error) {
        throw error;
    }
}

// --- ORDER QUERIES ---

export const getOrders = async (customerId) => {
    try {
        const [results] = await pool.execute('SELECT * FROM orders WHERE customer_id = ? ORDER BY o_date DESC, o_id DESC', [customerId]); 
        return results;
    } catch (error) {
        throw error;
    }
};

export const getOrderByIdAndCustomer = async (orderId, customerId) => {
    try {
        const [results] = await pool.execute('SELECT * FROM orders WHERE o_id = ? AND customer_id = ?', [orderId, customerId]);
        if (results.length > 0) return results[0];
        return null;
    } catch (error) {
        throw error;
    }
};

export const getAllOrdersAdmin = async () => {
    try {
        // join customer table to get emails as well
        const [results] = await pool.execute(`
            SELECT o.*, c.email, c.first_name, c.last_name 
            FROM orders o 
            JOIN customer c ON o.customer_id = c.customer_id
            ORDER BY o.o_id DESC
        `);
        return results;
    } catch (error) {
        throw error;
    }
}

export const updateOrderStatus = async (orderId, status) => {
    try {
        await pool.execute('UPDATE orders SET o_status = ? WHERE o_id = ?', [status, orderId]);
    } catch (error) {
        throw error;
    }
}

export const createOrder = async (customerId, products, totalAmount) => {
    try {
        if (!products || !products.length) throw new Error('No products available to process payment.');
        
        const paymentDetails = products.map(product => ({
            productId: product.id,
            productName: product.name,
            productDescpt: product.description,
            quantity: product.quantity
        }));

        const [paymentResult] = await pool.execute(
            'INSERT INTO payment (customer_id, amount, payment_method, paymentdetails) VALUES (?, ?, "Card", ?)',
            [customerId, totalAmount, JSON.stringify(paymentDetails)]
        );

        return {
            paymentId: paymentResult.insertId,
            paymentDetails: paymentDetails
        };
    } catch (error) {
        throw error;
    }
};

export const insertOrder = async (paymentId, customerId, totalAmount, paymentDetails) => {
    try {
        // o_items in schema is an INT. We will store the number of types of items.
        const o_items = paymentDetails.length; 
        const sql = 'INSERT INTO orders (payment_id, customer_id, o_items, o_total_amt, o_status, o_date) VALUES (?, ?, ?, ?, "Placed", CURDATE())';
        const [result] = await pool.execute(sql, [paymentId, customerId, o_items, totalAmount]);
        return result.insertId;
    } catch (error) {
        console.error('Error creating order:', error); 
        throw new Error('Failed to create order');
    }
};
