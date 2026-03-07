import express from 'express';
import { updateUserAddress, viewAddress, viewProfile } from '../controllers/userController.js';
import { requireLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/update-address/:customerId', requireLogin, updateUserAddress);
router.get('/address/:customerId', requireLogin, viewAddress);
router.get('/profile', requireLogin, viewProfile);

export default router;
