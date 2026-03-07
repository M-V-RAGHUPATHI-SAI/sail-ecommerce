import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';  
import { dirname } from 'path';       
import session from 'express-session';

// Import Routes
import indexRoutes from './routes/indexRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { getAddressByCustomerId } from './database/queries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(session({
    secret: 'your-secret-key-123456789', // Consider picking from process.env.SESSION_SECRET in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global definitions for templates
app.use(async (req, res, next) => {
    res.locals.customerId = req.session.customer_id || null;
    res.locals.isAdmin = req.session.isAdmin || false;
    res.locals.addressDetails = null;

    if (req.session.customer_id) {
        try {
            const address = await getAddressByCustomerId(req.session.customer_id);
            if (address) {
                address.id = req.session.customer_id; // Add ID for the Add New Address link
                res.locals.addressDetails = address;
            }
        } catch (err) {
            // Ignore error if address not found
            res.locals.addressDetails = {};
        }
    }
    
    next();
});

// Mount routes
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', cartRoutes);
app.use('/', productRoutes);
app.use('/', orderRoutes);
app.use('/', userRoutes);
app.use('/admin', adminRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke 💩');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
