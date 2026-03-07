import { updateAddress, getAddressByCustomerId, getCustomerById } from '../database/queries.js';

export const updateUserAddress = async (req, res) => {
    const customerId = req.params.customerId;
    // from former server.js
    const addressData = {
        address: req.body['address-1'],
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
};

export const viewAddress = async (req, res) => {
    const customerId = req.params.customerId;
    try {
        const addressDetails = await getAddressByCustomerId(customerId);
        res.render('address.ejs', { addressDetails, customerId });
    } catch(err) {
        res.status(500).send('Error fetching address');
    }
};

export const viewProfile = async (req, res) => {
    const customerId = req.session.customer_id;
    try {
        const customerDetails = await getCustomerById(customerId);
        if (!customerDetails) {
            return res.status(404).send('Customer not found');
        }
        res.render('profile.ejs', { customer: customerDetails });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Error fetching profile');
    }
};