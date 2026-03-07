import { addCustomer, getCustomerByEmailAndPassword, getCustomerByEmail } from '../database/queries.js';

export const renderLogin = (req, res) => {
    res.render('login', { error: null, signupError: null });
};

export const signup = async (req, res) => {
    const { first_name, last_name, date_of_birth, email, password, phno, address, city, state, country, pincode } = req.body;
    try {
        const existingCustomer = await getCustomerByEmail(email);
        if (existingCustomer) {
            return res.render('login', { error: null, signupError: 'User already exists. Please login.' });
        }
        
        const insertId = await addCustomer({ first_name, last_name, date_of_birth, email, password, phno, address, city, state, country, pincode });
        req.session.customer_id = insertId;
        
        res.redirect(`/?signup=success&customer_id=${insertId}`); 
    } catch (error) {
        console.error('Error signing up customer:', error);
        res.render('login', { error: null, signupError: 'An error occurred during signup.' });
    }
};

export const login = async (req, res) => {
    const { email, password, redirectFrom, product_id } = req.body;
    try {
        const customer = await getCustomerByEmailAndPassword(email, password);
        if (!customer) {
            return res.render('login', { error: 'Invalid email or password', signupError: null });
        }

        req.session.customer_id = customer.customer_id;
        if(email === 'admin@sail.com') {
            req.session.isAdmin = true;
        }

        // Redirect based on intent or original requested URL
        let redirectUrl = req.session.redirectTo || `/?login=success&customer_id=${customer.customer_id}`;
        delete req.session.redirectTo;

        if (redirectFrom === 'buyNow') {
            res.redirect(`/payment?customer_id=${customer.customer_id}&product_id=${product_id}`);
        } else {
            res.redirect(redirectUrl);
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'Error logging in. Please try again.', signupError: null });
    }
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/login');
    });
};
