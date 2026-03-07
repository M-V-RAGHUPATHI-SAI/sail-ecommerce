export const requireLogin = (req, res, next) => {
    if (!req.session.customer_id) {
        // Redirect to login if not authenticated
        req.session.redirectTo = req.originalUrl;
        return res.redirect('/login');
    }
    next();
};

export const requireAdmin = (req, res, next) => {
    if (req.session.isAdmin === true) {
        next();
    } else {
        res.redirect('/');
    }
};
