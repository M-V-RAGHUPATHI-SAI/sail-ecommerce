console.log("om sri sai ram")
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';  
import { dirname } from 'path';       
import session from 'express-session'; // Import express-session
import {
    getCartItems, 
    getProductById, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    addCustomer, 
    validateUser, 
    getAddressByCustomerId, 
    updateAddress, 
    getOrders, 
    getCustomerByEmailAndPassword, 
    searchProducts,
    createOrder,
    insertOrder // Assuming you have this function
} from './database.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Set up express-session middleware
app.use(session({
    secret: 'your-secret-key', // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.set("view engine", "ejs");

// Set the public directory for static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to handle JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form submissions

// Home Route
app.get('/', async (req, res) => {
    let addressDetails = {};

    // Check for addressDetails in query parameters
    if (req.query.address) {
        addressDetails = JSON.parse(decodeURIComponent(req.query.address)); // Assuming addressDetails are passed as a JSON string
    }

    // Render the main view with the retrieved address details
    res.render('main.ejs', { addressDetails });
});
app.get('/orders', async (req, res) => {
    let addressDetails = {};
    const customerId = req.session.customer_id; // Get customer_id from session

    // Check if address details are available in the request
    if (req.query.address) {
        try {
            addressDetails = JSON.parse(decodeURIComponent(req.query.address));
        } catch (error) {
            console.error('Error parsing address details:', error);
            return res.status(400).send('Invalid address format');
        }
    }

    if (!customerId) {
        console.error('Customer ID is missing in orders route.');
        return res.status(400).send('Customer ID is missing');
    }

    try {
        const orders = await getOrders(customerId); // Fetch orders from the database using customer_id

        // Check if orders were found
        if (!orders || orders.length === 0) {
            console.log('No orders found for this customer.');
            return res.render('orders', { orders: [], addressDetails }); // Pass empty array if no orders found
        }

        console.log(orders);
        // Render the orders view with orders and address details
        res.render('orders', { orders, addressDetails });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// Orders Route
// Cart Route: Render the cart page with cart items
app.get('/cart', async (req, res) => {
    let addressDetails = {};

    // Check if address details are available in the request
    if (req.query.address) {
        addressDetails = JSON.parse(decodeURIComponent(req.query.address));
    }

    try {
        const cartItems = await getCartItems(); // Fetch cart items with product details
        res.render('cart', { cartItems, addressDetails }); // Pass cartItems and addressDetails to the cart.ejs file
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Error fetching cart items' });
    }
});

// Add to Cart Route
app.post('/add-to-cart', async (req, res) => {
    const { productId } = req.body; // Extract productId from the request body
    try {
        await addToCart(productId); // Add the product to the cart
        res.redirect('/cart'); // Redirect to the cart page after adding the product
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('Failed to add product to cart');
    }
});

// Remove item from cart route
app.delete('/remove-from-cart/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
    try {
        const success = await removeFromCart(cartId);

        if (success) {
            return res.status(200).json({ message: 'Item successfully removed from the cart or quantity decreased.' });
        } else {
            return res.status(404).json({ message: 'Item not found in the cart.' });
        }
    } catch (error) {
        console.error(`Error in remove-from-cart route: ${error.message}`);
        return res.status(500).json({ message: 'Failed to remove item from cart.' });
    }
});

// Route to update the quantity of an item in the cart
app.put('/update-cart/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
    const { quantity } = req.body; // Extract the quantity from the request body

    try {
        await updateCartQuantity(cartId, quantity);
        return res.status(200).json({ message: 'Cart updated successfully.' });
    } catch (error) {
        console.error(`Error updating cart: ${error.message}`);
        return res.status(500).json({ message: 'Failed to update cart.' });
    }
});

// Customer signup route
app.post('/signup', async (req, res) => {
    const { first_name, last_name, date_of_birth, email, password, phno, address, city, state, country, pincode } = req.body;

    try {
        await addCustomer({ first_name, last_name, date_of_birth, email, password, phno, address, city, state, country, pincode });
        res.redirect('/?signup=success'); // Adding a query parameter for success
    } catch (error) {
        console.error('Error signing up customer:', error);
        res.status(500).send('An error occurred during signup.');
    }
});

// Customer login route
app.post('/login', async (req, res) => {
    const { email, password, redirectFrom, product_id } = req.body; // Get email, password, redirectFrom, and product_id
    console.log(email, password);

    try {
        const customer = await getCustomerByEmailAndPassword(email, password);

        if (!customer) {
            return res.status(401).send('Invalid email or password'); // Return error if credentials are invalid
        }

        req.session.customer_id = customer.customer_id; // Set customer_id in session
        // Successful login
        const addressDetails = {
            id: customer.customer_id, // Include customer_id in the address details
            address: customer.address,
            city: customer.city,
            state: customer.state,
            country: customer.country,
            pincode: customer.pincode
        };

        // Redirect based on the source
        if (redirectFrom === 'buyNow') {
            res.redirect(`/payment?customer_id=${customer.customer_id}&address=${encodeURIComponent(JSON.stringify(addressDetails))}&product_id=${product_id}`);
        } else {
            res.redirect(`/?login=success&address=${encodeURIComponent(JSON.stringify(addressDetails))}&customer_id=${customer.customer_id}`); // Redirect to the main page for any other action
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Error logging in');
    }
});

app.post('/update-address/:customerId', async (req, res) => {
    const customerId = req.params.customerId; // Get customer ID from URL parameters
    const addressData = {
        address: req.body['address-1'], // Change according to your form input names
        city: req.body['town-city'],
        state: req.body['state'],
        country: req.body['country'],
        pincode: req.body['pincode'],
    };
  
    try {
        await updateAddress(customerId, addressData);
        res.status(200).json({ message: 'Address updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update address' });
    }
  });
  
  // Get address by customer ID route
  app.get('/address/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
  
    // Fetch the customer's address details
    const addressDetails = await getAddressByCustomerId(customerId);
  
    // Render the address page with address details
    res.render('address.ejs', { addressDetails, customerId });
  });
  
  // Dynamic product routes (for product detail pages)
  // Dynamic product routes (for product detail pages)

// Payment Route
// Payment route: Handles both single product purchase and cart items
app.post('/payment', async (req, res) => {
    // Get customer_id from the session
    const customerId = req.session.customer_id;

    if (!customerId) {
        return res.status(401).send('Unauthorized: Please log in.');
    }

    try {
        let products = [];
        let totalAmount = 0;

        if (req.body.product_id) {
            const productId = req.body.product_id;
            const product = await getProductById(productId);

            if (product) {
                const productDetails = {
                    id: product.p_id,
                    name: product.p_name,
                    price: product.p_price,
                    quantity: 1
                };
                products.push(productDetails);
                totalAmount += productDetails.price;
            }
        }

        if (req.body.cartItems) {
            const cartItems = JSON.parse(req.body.cartItems);

            for (const item of cartItems) {
                const product = await getProductById(item.p_id);
                if (product) {
                    const cartProduct = {
                        id: product.p_id,
                        name: product.p_name,
                        price: product.p_price,
                        quantity: item.quantity
                    };
                    products.push(cartProduct);
                    totalAmount += cartProduct.price * item.quantity;
                }
            }
        }

        console.log('Customer ID:', customerId);
        console.log('Total Amount:', totalAmount);
        console.log('Products:', products);

        // Pass customerId to the view along with products and totalAmount
        res.render('payment', { 
            customerId: customerId,  // Pass customerId
            products: products, 
            totalAmount: totalAmount
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send('An error occurred while processing your payment.');
    }
});


// Create Order route: Handles creating orders after clicking "Proceed to Payment"
app.post('/create-order', async (req, res) => {
    // Get customer_id from the session
    const customerId = req.session.customer_id;

    if (!customerId) {
        return res.status(401).send('Unauthorized: Please log in.');
    }

    try {
        // Get cart items from request body
        const { cartItems } = req.body; // Only expect cartItems in the request body

        // Initialize products array and total amount
        const products = [];
        let totalAmount = 0;

        if (!cartItems) {
            return res.status(400).send('No cart items provided.');
        }
        // Handle cart items if any are provided
        const parsedCartItems = JSON.parse(cartItems); // Parse the cartItems from JSON

        for (const item of parsedCartItems) {
            const product = await getProductById(item.id); // Use 'id' for product lookup
            if (product) {
                products.push({
                    id: product.p_id,
                    name: product.p_name,
                    price: product.p_price,
                    quantity: item.quantity,
                    description: product.p_descpt
                });
                totalAmount += product.p_price * item.quantity; // Calculate total amount here
            }
        }

        // Check if products array exists and has items
        if (products.length === 0) {
            return res.status(400).send('No products found for order.');
        }
        // Create the payment and get payment details
        const { paymentId, paymentDetails } = await createOrder(customerId, products, totalAmount);

        // Insert the order using the payment details and payment ID
        const orderId = await insertOrder(customerId, paymentId, paymentDetails, totalAmount);

        // Fetch orders for the customer after creating the order
        const orders = await getOrders(customerId); // Fetch orders from the database using customer_id
        const addressDetails = await getAddressByCustomerId(customerId); // Get address details if necessary

        // Format the orders for rendering
        const formattedOrders = orders.map(order => ({
            orderId: order.o_id,
            orderDate: order.created_at,
            totalCost: order.o_total_amt,
            shipTo: addressDetails || "Default Shipping Address", // Use addressDetails or a default
            status: order.o_status, // Adjust based on your schema
            shippingMethod: "Standard Shipping", // Adjust if you have a method in your data
            orderItems : order.o_items
        }));

        console.log(orders);
        // Render the orders page with the formatted orders and address details
        res.render('orders', { orders: formattedOrders, addressDetails });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('An error occurred while creating your order.');
    }
});






app.get('/search', async (req, res) => {
    console.log("Search query:", req.query.query); 
    const query = req.query.query; // Get the search query from the URL
    try {
        const results = await searchProducts(query); // Query your database for products
        const addressDetails = {}; // Fetch this from your database or session

        res.render('searchResults.ejs', { results, query, addressDetails }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

for (let i = 1; i <= 30; i++) {
    app.get(`/pd${i}`, async (req, res) => {
        let addressDetails = {};
  
        // Check if address details are available in the request
        if (req.query.address) {
            addressDetails = JSON.parse(decodeURIComponent(req.query.address));
        }
  
        res.render(`pdfile${i}`, { addressDetails }); // Pass addressDetails to the template
    });
  }
  
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke 💩');
  });
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
