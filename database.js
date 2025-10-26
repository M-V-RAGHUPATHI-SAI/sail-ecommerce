import mysql from 'mysql2/promise'; 
import bcrypt from 'bcrypt';// Use the promise version

// Create a connection to the database
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Sai@2006', // Replace with your MySQL password
    database: 'saildb'
});



// Function to add a new customer
export const addCustomer = async (customerData) => {
  const { first_name, last_name, date_of_birth, email, password, phno, address, city, state, country, pincode } = customerData;

  // Hash the password before saving to the database
  const hashedPassword = await bcrypt.hash(password, 10); // You can adjust the salt rounds as needed

  try {
      const [result] = await connection.execute(
          `INSERT INTO customer (first_name, last_name, date_of_birth, email, password, phno, address, city, state, country, pincode) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [first_name, last_name, date_of_birth, email, hashedPassword, phno, address, city, state, country, pincode]
      );

      console.log(`New customer added with ID: ${result.insertId}`);
      return result.insertId; // Return the ID of the newly inserted customer
  } catch (error) {
      console.error('Error adding customer:', error);
      throw error; // Re-throw for further handling
  }
};

export const validateUser = async (email, password) => {
  try {
      const [rows] = await connection.execute(
          'SELECT * FROM customer WHERE email = ?',
          [email]
      );

      if (rows.length > 0) {
          const customer = rows[0];
          console.log('Fetched user from database:', customer); // Debugging line

          const isPasswordValid = await bcrypt.compare(password, customer.password);
          console.log('Stored hashed password:', customer.password);
          console.log('Input password:', password);
          console.log('Password valid:', isPasswordValid); // Debugging line

          return isPasswordValid ? customer : null; // Return customer if password is valid, else return null
      }

      return null; // Return null if no user found
  } catch (error) {
      console.error('Database query error:', error);
      throw error;
  }
};

// Function to get cart items for a specific product
export const getCartItems = async () => {
    try {
        // Join products and cart tables to fetch product details
        const [rows] = await connection.execute(
            'SELECT cart.cart_id, cart.quantity, products.p_id, products.p_name, products.p_price FROM cart JOIN products ON cart.product_id = products.p_id'
        );
        console.log(`Cart contains:`, rows); // Fetch all products with details as cart items
        return rows; 
    } catch (error) {
        console.error('Error fetching cart items:', error);
        throw error; // Re-throw for further handling
    }
};

// Function to add a product to the cart
export const addToCart = async (productId) => {
    try {
        const [productRows] = await connection.execute('SELECT * FROM products WHERE p_id = ?', [productId]);
        if (productRows.length > 0) {
            // Check if the product is already in the cart
            const [cartRows] = await connection.execute('SELECT * FROM cart WHERE product_id = ?', [productId]);
            if (cartRows.length > 0) {
                // If the product exists in the cart, increment the quantity
                const cartItemId = cartRows[0].cart_id; // Assuming you have a cart_id
                await connection.execute('UPDATE cart SET quantity = quantity + 1 WHERE cart_id = ?', [cartItemId]);
            } else {
                // Add product to cart if it does not exist
                await connection.execute(
                    'INSERT INTO cart (product_id, quantity) VALUES (?, ?)',
                    [productId, 1] // Default quantity to 1
                );
            }
            console.log(`Added to cart:`, productRows[0]); // Log the added product
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error(error);
        throw error; // Re-throw for further handling
    }
};

// Function to remove an item from the cart
export const removeFromCart = async (cartId) => {
    try {
        // Fetch the current quantity of the item in the cart
        const [cartRows] = await connection.execute('SELECT * FROM cart WHERE cart_id = ?', [cartId]);

        if (cartRows.length === 0) {
            throw new Error(`No item found with the provided cart ID: ${cartId}`);
        }

        const currentQuantity = cartRows[0].quantity;

        if (currentQuantity > 1) {
            // If quantity is greater than 1, decrement the quantity
            await connection.execute('UPDATE cart SET quantity = quantity - 1 WHERE cart_id = ?', [cartId]);
            console.log(`Decreased quantity of item with cart ID: ${cartId}. Current quantity: ${currentQuantity - 1}`);
        } else {
            // If quantity is 1, remove the item from the cart
            await connection.execute('DELETE FROM cart WHERE cart_id = ?', [cartId]);
            console.log(`Removed item with cart ID: ${cartId} from the cart.`);
        }

        return true; // Operation was successful
    } catch (error) {
        console.error(`Error removing item from cart: ${error.message}`);
        throw error; // Re-throw for further handling if necessary
    }
};

// Function to update the quantity of an item in the cart
export const updateCartQuantity = async (cartId, newQuantity) => {
    try {
        // Validate the new quantity
        if (newQuantity < 1) {
            throw new Error('Quantity must be at least 1');
        }

        // Update the quantity in the cart
        await connection.execute('UPDATE cart SET quantity = ? WHERE cart_id = ?', [newQuantity, cartId]);
        console.log(`Updated cart item with ID: ${cartId} to quantity: ${newQuantity}`);
    } catch (error) {
        console.error(error);
        throw error; // Re-throw for further handling
    }
};

// Function to get product by ID
export const getProductById = async (productId) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM products WHERE p_id = ?', [productId]);
        if (rows.length > 0) {
            console.log('Product details:', rows[0]);
            return rows[0]; // Return the product details
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        throw error; // Re-throw for further handling
    }
};

export const getAddressByCustomerId = async (customerId) => {
  try {
      const [rows] = await connection.execute(
          `SELECT address, city, state, country, pincode 
           FROM customer 
           WHERE customer_id = ?`,
          [customerId]
      );

      if (rows.length > 0) {
          return rows[0]; // Return the address details
      } else {
          throw new Error('Address not found for this customer');
      }
  } catch (error) {
      console.error('Error fetching address by customer ID:', error);
      throw error; // Re-throw for further handling
  }
};

export const getOrders = async (customerId) => {
  const query = 'SELECT * FROM orders WHERE customer_id = ?';
  try {
      const [results] = await connection.execute(query, [customerId]); // Use 'connection' instead of 'pool'
      return results;
  } catch (error) {
      throw new Error('Error fetching orders: ' + error.message);
  }
};


export const updateAddress = async (customerId, addressData) => {
  const { address, city, state, country, pincode } = addressData;

  try {
      await connection.execute(
          `UPDATE customer 
           SET address = ?, city = ?, state = ?, country = ?, pincode = ? 
           WHERE customer_id = ?`,
          [address, city, state, country, pincode, customerId]
      );

      console.log(`Address updated for customer ID: ${customerId}`);
  } catch (error) {
      console.error('Error updating address:', error);
      throw error; // Re-throw for further handling
  }
};

export async function getCustomerByEmailAndPassword(email, password) {
  try {
      const [rows] = await connection.execute('SELECT * FROM customer WHERE email = ?', [email]);

      if (rows.length === 0) {
          return null; // Customer not found
      }
      console.log(rows[0])
      const customer = rows[0];

      const passwordMatch = await bcrypt.compare(password, customer.password);

      if (passwordMatch) {
          return customer; // Password matches, return customer data
      } else {
          return null; // Password doesn't match
      }
  } catch (error) {
      console.error('Error fetching customer by email and password:', error);
      throw error;
  }
}

export const createOrder = async (customerId, products, totalAmount) => {
    try {
        // Check if products array is valid before proceeding
        if (!products || !products.length) {
            throw new Error('No products available to process payment.');
        }

        // Map to extract relevant product details
        const paymentDetails = products.map(product => ({
            productId: product.id,
            productName: product.name,
            productDescpt: product.description,
        }));

        // Insert the payment details
        const [paymentResult] = await connection.execute(
            'INSERT INTO payment (customer_id, amount, payment_method, paymentdetails) VALUES (?, ?, "Card", ?)',
            [customerId, totalAmount, JSON.stringify(paymentDetails)]
        );

        // Return payment ID and payment details
        return {
            paymentId: paymentResult.insertId,
            paymentDetails: paymentDetails
        };
    } catch (error) {
        console.error('Error creating payment:', error);
        throw new Error('Failed to create payment');
    }
};

export const insertOrder = async (paymentId, customerId,totalAmount, paymentDetails) => {
    try {
        console.log(paymentId, customerId,paymentDetails,totalAmount);

        // Create an object to hold both cart items and payment details
        

        const o_items = totalAmount; // Convert the order details to a JSON string
        const sql = 'INSERT INTO orders (payment_id, customer_id, o_items, o_total_amt, o_status) VALUES (?, ?, ?, ?, "In progress")';
        
        const [result] = await connection.execute(sql, [customerId, paymentId, o_items, paymentDetails]); // Ensure the order of parameters matches the SQL statement
        return result.insertId; // Return the ID of the newly inserted order
    } catch (error) {
        console.error('Error creating order:', error); // Log the error for debugging
        throw new Error('Failed to create order');
    }
};




// Your function to search products
export const searchProducts = async (query) => {
    const sql = 'SELECT * FROM products WHERE LOWER(p_descpt) LIKE ?'; // Query to search for products
    const values = [`%${query.toLowerCase()}%`]; // Use wildcard for search

    try {
        const [results] = await connection.execute(sql, values); // Use connection.execute with async/await
        return results; // Return the results
    } catch (error) {
        throw error; // Handle any errors
    }
};



// getCustomerByEmailAndPassword('mastan@gmail.com','786')
// Uncomment this line to test the function
// const address = await getAddressByCustomerId(1014); // Replace 1 with the actual customer ID
// console.log(address);
// Uncomment the following lines to test the functions
// await addToCart(101);
// await addToCart(102);
